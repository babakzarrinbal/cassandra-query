#!/usr/bin/env node
let chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const args = require("minimist")(process.argv.slice(2));
const promise = require("bluebird");
const cassandra = promise.promisifyAll(require("cassandra-driver"));
const log = (...args) => console.log(...args);
const printProgress = (progress) =>{
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(progress);
}
const configargs = require("./configs/arglist.js");
let configs = require("./configs/savedconfigs.json");

const { showconfig } = require("./utils/display");
// const { reject } = require("bluebird");
// const { finished } = require("stream");

if (args.help) {
  return log(
    chalk.blue("\n\n" + fs.readFileSync("./readme.md", "utf8") + "\n\n")
  );
}

//getting configs
if (args.config === true || args.c === true) args.config = "default";
const config =
  configs[args.config || args.c|| "default" ]|| {};
fs.writeFileSync(
  path.resolve(__dirname,"./configs/previousconfigs.json"),
  JSON.stringify(config, null, 2)
);

//mergingconfigs
for (let c in configargs) {
  for (let co of configargs[c].args || configargs[c]) {
    if (args[co] !== undefined) config[c] = args[co];
  }

  if (config[c] === undefined && configargs[c].default !== undefined)
    config[c] = configargs[c].default;

  let callback = configargs[c].runtimeCallback || configargs[c].callback;
  if (config[c] !== undefined && callback) config[c] = callback(config[c]);
}

// cancel operation if query not exists
if (!config.query) {
  log(chalk.red.bold("No query specified"));
  return process.exit();
}

log(
  chalk.yellow(
    `using configs (${
      configs[args.config || args.c]
        ? "saved config: " + (args.config || args.c)
        : "prevoiusly used"
    }):`
  ),
  chalk.blue(showconfig(config, "  "))
);

//connecting to cassandra
const cassConfig = {
  contactPoints: config.hosts,
  keyspace: config.keyspace,
  authProvider: new cassandra.auth.PlainTextAuthProvider(
    config.username,
    config.password
  ),
};
const cassaClient = new cassandra.Client(cassConfig);
cassaClient
  .connectAsync()
  .then(log(chalk.green("Cassandra Client initialized")))
  .catch((err) => {
    console.log(
      chalk.red(
        "Couldn't connect to Cassandra so shutting down.\n Error:\n",
        err
      )
    );
    process.exit();
  });

//querying function
const executeQuery = (query) =>
  new Promise((resolve, reject) =>
    cassaClient.execute(
      query,
      [],
      { readTimeout: Number(config.timeout) },
      (err, result) => {
        if (err) {
          log(chalk.red("Error on query - >  " + "\n" + query + "\n" + err));
          reject(err);
        }
        resolve(result);
      }
    )
  );

//merging all arguments for query
let qargs = config.args ? [config.args] : [];
if (config.argsFile)
qargs.push(...fs.readFileSync(config.argsFile,'utf-8').split("\n").filter(r=>r));
qargs = qargs.map(qa=>qa.split(config.argSeperator))

// mapping argument to query
if (config.argMap) {
  let map = config.argMap.split(",");
  qargs = qargs.map((a) => {
    return map.map((m) => a[Number(m)-1]);
  });
}


qargs = !qargs.length ? [[]] : qargs;
let result = [];
log(chalk.green("querying started:"));
let counterId = 0;
for (let arg of qargs) {
  let i = -1;
  let query = config.query.replace(
    new RegExp(config.placeHolder, "g"),
    () => (i++,arg[i] === undefined ? "" : arg[i])
  );
  
  let resolver;
  let finised = new Promise((r) => (resolver = r));

  let counter = () => {
    counterId+=1;
    try {
      printProgress(`  ${counterId} of ${qargs.length} is done`);
    } catch (e) {}
    if (counterId == qargs.length) resolver();
  };

  executeQuery(query)
    .then((r) => (result.push({ [query]: r.rows }), counter()))
    .catch((error) => (result.push({ [query]: error }), counter()));

  // finishing up
  finised.then(() => {
    console.log(result);
    result = JSON.stringify(result, null, 2);
    if (config.output) {
      fs.writeFileSync(config.output, result);
      log(chalk.green("results: ", config.output));
    } else {
      // log(chalk.green("results: \n",result)  );
    }
    process.exit();
  });
}

#!/usr/bin/env node
const configargs = require("./configs/arglist.js");
let chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const args = require("minimist")(process.argv.slice(2));
let configs;
try {
  configs = require("./configs/savedconfigs.json");
} catch (e) {
  configs = {};
}
const { showconfig } = require("./utils/display");

if (args.help) {
  return console.log(
    chalk.blue("\n\n" + fs.readFileSync("./readme.md", "utf8") + "\n\n")
  );
}
if (!args.set && !args.get) args.get == true;

if (args.get === true) {
  if (args.configFile) {
    fs.writeFileSync(
      args.configFile === true ? "./configs.json" : args.configFile,
      JSON.stringify(configs, null, 2)
    );
  } else {
    console.log(chalk.blue(showconfig(configs)));
  }
  return;
}
if (args.get) {
  if (args.configFile) {
    fs.writeFileSync(
      args.configFile === true ? "./"+args.get+".json" : args.configFile,
      JSON.stringify(configs[args.get] ||{} , null, 2)
    );
  } else {
    console.log(
      chalk.blue(showconfig(configs[args.get]) || "\n No such config exists\n")
    );
  }
  return ;
}
if (args.set && args.configFile) {
  let configsingletype = false;
  args.configFile  = args.configFile === true ? "./configs.json" : args.configFile
  let config = require(path.resolve(
    args.configFile
  ));
  for (let c in config) {
    if (typeof config[c] != "object") {
      configsingletype = true;
      break;
    }
  }
  if (!configsingletype) {
    configs = { ...configs, ...config };
  } else {
    let cf = args.configFile.replace(/\\/g, "/").lastIndexOf("/") + 1;
    args.set = args.set === true ? cf.slice(0, cf.lastIndexOf(".")) : args.set;
    configs[args.set] = config;
  }
} else {
  args.set = args.set === true ? "default" : args.set;
  const config = {};

  for (let c in configargs) {
    for (let co of configargs[c].args || configargs[c]) {
      if (args[co] !== undefined) {
        config[c] = args[co];
      }
    }
    if (config[c] === undefined && configargs[c].default !== undefined)
      config[c] = configargs[c].default;

    let callback = configargs[c].initCallback || configargs[c].callback;
    if (config[c] !== undefined && callback) config[c] = callback(config[c]);
  }

  configs[args.set] = configs[args.set] || {};
  for (let c in config) {
    configs[args.set][c] = config[c];
  }
}

fs.writeFileSync(
  path.resolve(__dirname, "./configs/savedconfigs.json"),
  JSON.stringify(configs, null, 2)
);
console.log(chalk.green(showconfig(args.set === true? configs : configs[args.set])));

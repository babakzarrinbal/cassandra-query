const path = require("path");

module.exports = {
  query: ["query", "q"],
  argsFile: {
    args: ["argFile", "argfile", "f"],
    callback: (p) => path.resolve(p),
    initCallback: null,
    runtimeCallback: null,
  },
  args: ["args", "a"],
  argMap: ["argMap", "argmap", "m"],
  argSeperator: { args: ["argSeperator", "argseperator", "s"], default: "," },
  placeHolder: { args: ["placeHolder", "placeholder", "v"], default: "%s" },
  hosts: {
    args: ["host", "contactpoints", "contactPoints", "h"],
    default: "localhost",
    runtimeCallback: (h) => h.split(",").map((_) => _.trim()),
  },
  keyspace: ["keyspace", "keySpace", "k"],
  username: ["userName", "username", "user", "u"],
  password: ["password", "p"],
  output: {
    args: ["output", "o"],
    callback: (p) =>
      p === true ? path.resolve("./output.json") : path.resolve(p),
  },
  timeout: { args: ["timeout", "t"], default: 5000 },
};

const showconfig = function showconfig(config, prefix = "", level = 0) {
  let result = [];
  let i = 0;
  for (c in config) {
    result[i++] =
      prefix +
      " ".repeat(level) +
      (typeof config[c] == "object"
        ?  c + ":" + showconfig(config[c], prefix, level + 2)
        : (!isNaN(c) ? "" : c + ": ") + config[c]);
  }
  return "\n" + result.join("\n") + (level ? "" : "\n");

  // return (
  //   "\n" +
  //   Object.keys(config)
  //     .map(
  //       (c) =>
  //         " ".repeat(level) +
  //         (typeof config[c] == "object"
  //           ? "-" + c + ":" + showconfig(config[c], level + 2)
  //           : c + ": " + config[c])
  //     )
  //     .join("\n") +
  //   "\n"
  // );
};
module.exports = { showconfig };

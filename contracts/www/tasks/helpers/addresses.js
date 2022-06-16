const fs = require("fs");
const YAML = require("yaml");

const getAddresses = (network) => {
  const file = fs.readFileSync("./contracts.yaml", "utf8");
  const addresses = YAML.parse(file);
  return addresses[network];
};

const setAddresses = (network, addresses) => {
  // TODO
};

module.exports = {
  getAddresses: getAddresses,
  setAddresses: setAddresses,
};

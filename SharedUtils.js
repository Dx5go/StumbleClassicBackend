const config = require("./config");
const shared = require("./shared.json");

if (config.urls?.backendPublicUrl) {
  shared.BackendUrl = config.urls.backendPublicUrl;
}

function generateAuthPayload() {
  const salt = config.secrets.leagueSalt;
  if (!salt) {
    throw new Error("LEAGUE_SALT is not defined in the environment");
  }

  return shared;
}

module.exports = {
  generateAuthPayload,
  sharedConfig: shared
};

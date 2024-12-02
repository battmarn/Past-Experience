const devConfig = require("./dev.config");

module.exports = Object.assign({}, devConfig, {
  entry: ["./src/axe.tsx", "webpack-dev-server/client?http://127.0.0.0:3000/"],
});

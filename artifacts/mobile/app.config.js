// Wraps app.json so the static web export can be hosted under a sub-path
// (e.g. GitHub Pages project sites): EXPO_BASE_URL=/Soul-Chemistry-Hub
const { expo } = require("./app.json");

module.exports = () => ({
  expo: {
    ...expo,
    experiments: {
      ...expo.experiments,
      ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
    },
  },
});

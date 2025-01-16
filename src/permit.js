const { Permit } = require("permitio");

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PERMIT_PDP_URL,
});

module.exports = permit;

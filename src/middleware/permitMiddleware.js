const permit = require("../permit");

const permitMiddleware = async (req, res, next) => {
  //   console.log("middleware permit", permit);
  try {
    console.log("reached");
    const { userId, action, resource, tenantKey } = req.body;
    console.log("reached2222");

    if (!userId || !action || !resource || !tenantKey) {
      return res
        .status(400)
        .send({ error: "Missing required fields for permission check." });
    }

    console.log("reache333");
    const permitted = await permit.check(userId, action, {
      type: resource,
      tenant: tenantKey,
    });
    console.log("reache444");

    console.log("external middleware", permitted);

    if (!permitted) {
      return res
        .status(403)
        .send({ error: "Access denied. Insufficient permissions." });
    }

    next();
  } catch (error) {
    console.error("Permission check failed:", error);
    res
      .status(500)
      .send({ error: "Permission check failed. Please try again later." });
  }
};

module.exports = permitMiddleware;

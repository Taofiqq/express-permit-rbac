const permit = require("../config/permit");

const checkPermission = (action) => async (req, res, next) => {
  const { user } = req;

  try {
    const allowed = await permit.check(user.id, action, {
      type: "Documents",
      tenant: user.tenantId,
    });

    if (!allowed) {
      return res.status(403).json({
        error: "Permission denied",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: "Permission check failed",
    });
  }
};

module.exports = checkPermission;

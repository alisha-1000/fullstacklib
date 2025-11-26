const checkRole = (allowedRoles) => {
  return (req, res, next) => {

    // 🔥 Convert single string → array
    if (typeof allowedRoles === "string") {
      allowedRoles = [allowedRoles];
    }

    // 🔥 Ensure req.userInfo exists and role matches
    if (!req.userInfo || !allowedRoles.includes(req.userInfo.role)) {
      return res
        .status(403)
        .json({ error: true, message: "Access Denied: Unauthorized role" });
    }

    next();
  };
};

module.exports = { checkRole };

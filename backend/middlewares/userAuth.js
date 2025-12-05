const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: attach full decoded payload (id, email, name, role)
    req.userInfo = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role, // <--- THIS was missing in your version
    };

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = { userAuth };

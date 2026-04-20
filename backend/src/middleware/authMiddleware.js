import jwt from "jsonwebtoken";

// ✅ CORRECTED: Verify Token - Extract token from "Bearer <token>" format
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ CORRECTED: Check if authorization header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // ✅ CORRECTED: Split "Bearer <token>" and extract just the token
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // ✅ CORRECTED: Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user data from JWT
    next();
  } catch (err) {
    // ✅ CORRECTED: Better error handling for expired or invalid tokens
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Role-Based Access Control
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // ✅ CORRECTED: Check if user role is in allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied - insufficient permissions" });
    }
    next();
  };
};
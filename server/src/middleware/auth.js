import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub || decoded.id || decoded._id; // support different shapes
    if (!req.userId) throw new Error("Invalid token payload");
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

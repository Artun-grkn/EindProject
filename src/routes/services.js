// middleware/authMiddleware.js — gebruikt om routes te beschermen
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Niet geautoriseerd' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // bevat userId en role
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ongeldig token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin toegang vereist' });
  next();
}

module.exports = { verifyToken, requireAdmin };

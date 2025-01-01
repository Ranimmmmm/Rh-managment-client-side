import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET

function generateAccessToken() {
    const payload = { role: 'admin' }; // or any identifying role or info
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  }
export function vertifyToken(token) {
    const decoded =  jwt.verify(token , JWT_SECRET);
    return decoded;
}
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(403).send("Access denied.");
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).send("Invalid token.");
  
      req.user = user; // Attach user info to request
      next();
    });
  }
  
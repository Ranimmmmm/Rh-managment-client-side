const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send("Access denied.");

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).send("Invalid or expired token.");
        req.user = decoded; // Attach decoded token to the request if needed
        next();
    });
}

// Google authentication route
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback route to issue JWT
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Generate a JWT with user info after successful login
        const token = jwt.sign({ email: req.user.email, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        
        // Send the token to the client; you might send it as a JSON response or set a cookie
        res.json({ token });
    }
);

// Protected route example (only accessible with valid JWT)
router.get('/employee/TeamActivity', authenticateToken, (req, res) => {
    res.send("This is a protected route accessible only to authorized users.");
});

module.exports = router;

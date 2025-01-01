const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the unified Sequelize setup
const ensureDatabase = require('./ensureDatabase');
const passport = require('passport');
const path = require('path');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('./cron/holidayScheduler');


const dotenv = require ('dotenv').config();
const app = express();
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }));
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,PATCH,UPDATE',
    allowedHeaders: 'Content-Type ,Authorization',
}));

// Passport Google OAuth configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // Here, adapt to look up your user in the database, possibly adjusting or creating a record
    // Example: User.findOrCreate({ googleId: profile.id }, function (err, user) { return cb(err, user); });
    return cb(null, profile);
  }
));

// Serialize and deserialize user instances to and from the session.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Use express-session to manage sessions
app.use(session({
    secret: 'secret', // use a secret key
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
//static Folder
app.use("/media", express.static("public"));
app.use("/profiles", express.static("public/images/profiles"));
// Import your route handlers
const authentificationRoutes = require('./routes/authentificationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const activityRoutes = require('./routes/activityRoutes');
const summaryRoutes = require ('./routes/summaryRoutes')
const publicHolidayRoutes = require('./routes/publicHolidayRoutes')

// Use your routes
app.use('/users', authentificationRoutes)
app.use('/employees', employeeRoutes);
app.use('/activities', activityRoutes);
app.use('/employee-summary', summaryRoutes);
app.use('/public-holidays', publicHolidayRoutes);

// Define authentication routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to your desired endpoint
    res.redirect('/');
  });

const PORT = process.env.PORT || 3000;

// Ensure the database is set up before listening
ensureDatabase()
    .then(() => {
        db.sequelize.sync({ alter: true }).then(() => {
            console.log('Database synchronized.');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }).catch(err => {
            console.error('Failed to sync database:', err);
        });
    })
    .catch(err => {
        console.error('Failed to ensure database:', err);
    });

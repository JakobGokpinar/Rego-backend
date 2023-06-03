const express = require("express");
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const MongoDbStore = require('connect-mongo');
var cron = require('node-cron');
const connectDB = require('./config/db.js');

var authRouter = require('./auth');
var userRouter = require('./fetchUser.js');
var annonceRouter = require('./createAnnonce.js');
var searchRouter = require('./search.js')
var findProductRouter = require('./findProduct.js');
var searchProductRouter = require('./searchProduct.js');
var addFavoritesRouter = require('./addfavorites.js');
var profileSettingsRouter = require('./profileSettings.js');

const app = express();

// const PORT = config.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Connecting to database
connectDB();

app.use(express.json({limit: '50mb'}))  // setting limit to 50mb in order to save 'image encoded data' to server when uploading a new annonce
// app.use(express.json());

app.use(express.urlencoded({ extended: false, limit: '50mb'})); //setting limit for the same reason

app.use(cors({origin:'http://localhost:3000', credentials: true}));
// app.use(cors({origin:'https://www.rego.live', credentials: true}));
app.enable('trust proxy')
// app.set('trust proxy', 2)
app.use(
    session({
        name: 'signin-cookie',
        secret: "very secret key",
        resave: false,
        saveUninitialized: true,
        proxy: true,
        store: MongoDbStore.create({
            mongoUrl: MONGO_URI
        }),
        cookie: {
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 30  //1 ay. milisaniye x saniye x dakika x saat
        }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.send("Server Side Works!"));
app.use('/', authRouter)
app.use('/fetchuser', userRouter)
app.use('/newannonce', annonceRouter)
app.use('/search', searchRouter)
app.use('/product', findProductRouter)
app.use('/searchproduct', searchProductRouter)
app.use('/favorites', addFavoritesRouter);
app.use('/profile', profileSettingsRouter)

// const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const server = app.listen(3080, "0.0.0.0", () => console.log(`Server running on`));

cron.schedule('* 10 * * *', () => {
    fetch('https://rego-api.onrender.com', {method: 'GET'}).then(() => console.log('server pinned'))
});

module.exports = app;

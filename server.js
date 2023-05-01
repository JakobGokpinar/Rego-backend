const express = require("express");
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const MongoDbStore = require('connect-mongo');
const socketio = require('socket.io');

const config = require('./config/config');
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

const PORT = config.PORT;
const MONGO_URI = config.db.mongoURI;

// Connecting to database
connectDB();

app.use(express.json({limit: '50mb'}))  // setting limit to 50mb in order to save image encoded data to server when uploading a new annonce
// app.use(express.json());

app.use(express.urlencoded({ extended: false, limit: '50mb'})); //setting limit for the same reason

app.use(cors({origin:'http://localhost:3000', credentials: true}));

app.use(
    session({
        name: 'signin-cookie',
        secret: "very secret key",
        resave: false,
        saveUninitialized: true,
        store: MongoDbStore.create({
            mongoUrl: MONGO_URI
        }),
        cookie: {
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

//const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const server = app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

const io = socketio(server, {
    pingTimeout: 60000,
});

io.on('connection', (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit('connected')
    })
})
module.exports = app;

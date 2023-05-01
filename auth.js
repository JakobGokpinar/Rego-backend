var express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const Strategy  = require("passport-local").Strategy;
const { OAuth2Client } = require('google-auth-library');
var validator = require('validator');

const UserModel = require('./models/UserModel.js');
const GoogleUserModel = require('./models/GoogleUserModel.js');
const config = require('../aws-config.js');


const GOOGLE_CLIENT_ID = config.google.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = config.google.GOOGLE_CLIENT_SECRET;

// ####### FUNCTONS #######

/* LocalStrategy bir kullanıcı kaydetme şekli. Local verilen değerleri kullan diyor. 
Mesela Google hesabı ile kullanıcı açıcak olsaydık Google Strategy kullanırdık 
local-sign in kullanıcı girişi için oluşturulmuş bir LocalStrategy
signin metodu içinde passport.authenticate çalıştırıldığında kullanıcının girdiği email ve şifre 
buraya geliyor. 
*/
passport.use('local-signin', new Strategy({ usernameField: 'email'}, async (email,password,done) => {
    //ON DEPLOYMENT
/*     const isEmail = validator.isEmail(email);
    if (!isEmail) return done("Email is invalid", false, {message: 'Email is invalid'}) */

    UserModel.findOne({ email: email}).then(user =>  {
        // check if email exists
        if (!user) {
            return done(null,false, {message: 'User not found.'});
        }
        // check if passwords matches
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) return done(null,false, {message: 'Wrong password'})
            // return user with no error
            return done(null,user)
        })
    })
    .catch(err => {
        return done(null, false, {message: err})
    })
}))

// sign up için yapılan LocalStrategy
passport.use('local-signup', new Strategy({ usernameField: 'email'}, async (email,password, done) => {  //email and password is fetched automatically from req.body
    try {
        // check if user exists
        const userExists = await UserModel.findOne({ 'email': email})
        if (userExists) {
            return done(null, false, {message: 'user already exists'})
        }
        // create new user with the provided data
        const user = await UserModel.create({ email, password });
        return done(null, user, { message: 'user created'})
    } catch (err) {
        return done(err)
    }
}))

passport.use('google-auth', new Strategy({ usernameField: 'credential'}, async (credential, password, done) => {
    try {
        const decodedToken = await getDecodedOAuthJwtGoogle(credential)
        console.log('decoded', decodedToken)
        
        const email = decodedToken["payload"].email;    
        const userExists = await UserModel.findOne({ 'email': email})
        if (userExists) {
            return done(null, userExists, {message: 'existing user'})
        }

        const name = decodedToken["payload"].given_name;
        const lastname = decodedToken["payload"].family_name;
        const username = decodedToken["payload"].name;
        const profilePicture = decodedToken["payload"].picture;
        
        // create new user with the provided data
        const user = await GoogleUserModel.create({ name, lastname, username, email, profilePicture });
        return done(null, user, { message: 'new user created'})
    } catch (err) {
        return done(err)
    }
}))

getDecodedOAuthJwtGoogle = async (token) => {  
    try {
      const client = new OAuth2Client(GOOGLE_CLIENT_ID)
  
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      })
      return ticket;

    } catch (error) {
      return { status: 500, data: error }
    }
}

// giris yapan kullanıcıyı session'la
passport.serializeUser((user, done) => {
    done(null, user.id)
})
// kullanıcıdan istek geldiğinde doğrula
passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err,user)
    })
})

// express'in sağladığı Router servisi
var router = express.Router();

googleAuthentication = async (req, res, next) => {
    passport.authenticate('google-auth', function(err, user, info) {
        console.log(info)
         if(err) {
            console.log(err);
            return res.json(err)
        }

        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.json({ user, message: 'User logged in'})
        }) 
    })(req, res, next)
}

// giris yapmak için sign in metodu
signin = async (req, res, next) => {
    // local strategy'i kullan
    passport.authenticate("local-signin", function(err, user, info) {
        if (err)  return next(err) //res.json(err);     email validator kullanıldığı zaman geçerli 
        // if user doesn't exist return the message from done function in LocalStrategy
        if (!user) return res.json(info) 
        // Kullanıcıyı log in yap
        req.logIn(user, function(err){
            if(err) return next(err);
            return res.json({  user, message: 'user logged in'})
        })
    })(req, res, next);
}
// yeni kullanıcılar için sign up metodu
signup = (req, res, next) => {
    passport.authenticate("local-signup", function(err, user, info) {
        if (err)  return next(err);       
        if (!user) return res.json(info);

        let email = req.body.email;
        let name = req.body.name;
        let lastname = req.body.lastname;
        let username = name + " " + lastname;

        UserModel.findOneAndUpdate({ email: email}, {name, lastname,username});

        return res.json({  user, message: 'user created'})    //info: LocalStrategy'deki done metodundaki verileri döner
    })(req, res, next);
} 

// çıkış yapan kullanıcılar için logout metodu
logout = (req, res, next) => {
    // req.logout();   //passport.js logout metodunu kullanarak çıkış yap
    req.session.destroy();  //destroy yapmak db'deki cookie'leri de imha eder. O yüzden daha mantıklı.
    res.json('user logged out')
}

// ####### ROUTES #######

router.post('/login', signin);
router.post('/signup', signup);
router.delete('/logout',logout)
router.post('/google/auth', googleAuthentication)

  module.exports = router;

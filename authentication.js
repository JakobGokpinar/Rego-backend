var express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const Strategy  = require("passport-local").Strategy;
var validator = require('validator');
var passwordValidator = require('password-validator');
const generateUniqueId = require('generate-unique-id');
const emailVerify = require('./sendEmail.js')
require('dotenv').config();

const UserModel = require('./models/UserModel.js');


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
            return done(null,false, {message: 'Denne e-postadressen finnes ikke'});
        }
        // check if passwords matches
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) return done(null,false, {message: 'Passord er feil'})
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
            return done(null, false, {message: 'Denne e-postadressen er registrert i systemet. Vennligst logg deg inn'})
        }
        if(validator.isEmail(email) === false) {
            return done(null, false, { message: 'Vennligst oppgi en gyldig e-post' })
        }

        var passwordSchema = new passwordValidator();
        passwordSchema.is().min(6);
        passwordSchema.is().max(32);
        passwordSchema.has().lowercase();
        passwordSchema.has().uppercase();
        passwordSchema.has().digits(1);

        if(!passwordSchema.validate(password)) {
            return done(null, false, { message: 'Password must contain at least one number, one uppercase letter, one lowercase letter, be 6-32 characters long'})
        }

        // create new user with the provided data
        const user = await UserModel.create({ email, password });
        return done(null, user, { message: 'user created'})
    } catch (err) {
        return done(err)
    }
}))


// giris yapan kullanıcıyı session'la
passport.serializeUser((user, done) => {
    done(null, user.id)
})

/* kullanıcıdan istek geldiğinde doğrula. 
    browser'dan gelen Cookie ID ile MongoDB'deki gerekli cookie'yi bulur. 
    Gerekli cookie, "passport": {"user": "the-user-id"} şeklinde bir parametre içerir.
    Fonkisyon burdan aldığı userID'yi UserModel'de aratır ve bu sayede request'i yapan kullanıcı bulunmuş olunur.
*/
passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err,user)
    })
})
// express'in sağladığı Router servisi
var router = express.Router();


// giris yapmak için sign in metodu
signin = async (req, res, next) => {
    // local strategy'i kullan
    passport.authenticate("local-signin", function(err, user, info) {
        if (err)  return next(err) //res.json(err);     email validator kullanıldığı zaman geçerli 
        // if user doesn't exist return the message from done function in LocalStrategy
        if (!user) return res.status(401).json(info) 
        // Kullanıcıyı log in yap. reqLogin bir session açar, session ID'yı cookie içerisinde browser'da saklar
        req.logIn(user, function(err){
            if(err) return next(err);
            const {username, _id} = user;
            res.json({ username, _id })
        })
    })(req, res, next);
}

// yeni kullanıcılar için sign up metodu
signup = async (req, res, next) => {
    passport.authenticate("local-signup", async function(err, user, info) {
        if (err)  return next(err);       
        if (!user) return res.status(401).json(info);

        let email = req.body.email;
        let name = req.body.name;
        let lastname = req.body.lastname;
        let username = name + " " + lastname;

        try {
            const data = await UserModel.findOneAndUpdate(
              { email: email },
              { name, lastname, username },
              { new: true, useFindAndModify: false }
            );                
                const receiver_email = data.email;
                const receiver_username = username;
                const receiver_id = data._id;
                const email_verify_token = generateUniqueId();
                await emailVerify(receiver_email, receiver_username, receiver_id, email_verify_token)
                const { username, _id } = data;
                res.json({ username, _id })
        } catch (error) {
            console.log("🚀 ~ file: auth.js:174 ~ passport.authenticate ~ error:", error)
            return res.status(500).json({   message: 'user could not be created', err: error.message})
        }
    })(req, res, next);
} 

// çıkış yapan kullanıcılar için logout metodu
logout = (req, res) => {
    if(req.isAuthenticated()) {
        req.session.destroy();  //destroy yapmak db'deki cookie'leri de imha eder. O yüzden daha mantıklı.
        res.json({user: req.user, message: 'user logged out'});
        return
    } 
    res.json()
}

checkAuthorized = (req, res) => {
    console.log("🚀 ~ session:")
    if(req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.json("you have no access")
    }
}

// ####### ROUTES #######
router.post('/login', signin);
router.post('/register', signup);
router.delete('/logout',logout)
router.get('/isauth',checkAuthorized)

  module.exports = router;

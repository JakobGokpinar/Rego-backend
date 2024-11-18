const { OAuth2Client } = require('google-auth-library');
const GoogleUserModel = require('./models/GoogleUserModel.js');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

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

router.post('/google/auth', googleAuthentication)

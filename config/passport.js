const passport = require("passport");
const JwtStrategie = require("passport-jwt").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { ExtractJwt } = require("passport-jwt");
const secret = require("../config/keys").secret;

passport.use(  // מבקשים להשתמש ב״פספורט״ באמצעות הדרך הבאה
  new JwtStrategie(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'), //  jwtהדרך שבא אני מייבא את ה 
      secretOrKey:secret
    },
    async (payload, done) => {  //  שלו jwtחיפוש המשתמש באמצעות תעודת זהות שלו וכך מחזיר את ה   
      try {
        const user = await User.findById(payload.id)
        if (!user){
          return done(null,false);//   וכך המשתמש לא יוכל להיכנס לדף-false אם אין משתמש כזה מחזיר 
        }
        done(null,user); // אחרת מחזיר את ה״משתמש״
        
      } catch (error) { // false אם יש בעיה כלשהיא גם מחזיר 
        done(error,false);
        
      }
    }
  )
);
const LoginRequired = passport.authenticate ('jwt',{session:false}); 
module.exports = LoginRequired;
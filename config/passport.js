const passport = require("passport");
const JwtStrategie = require("passport-jwt").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { ExtractJwt } = require("passport-jwt");
const secret = require("../config/keys").secret;
//check if the user allow
passport.use(
  new JwtStrategie(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey:secret
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id)
        if (!user){
          return done(null,false);// no problem,can not in
        }
        done(null,user);
        
      } catch (error) {
        done(error,false);
        
      }
    }
  )
);

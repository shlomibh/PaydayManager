const passport = require("passport");
const JwtStrategie = require("passport-jwt").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { ExtractJwt } = require("passport-jwt");
const secret = require("../config/keys").secret;
// הדרך שבה יתבצע אימות המשתמש.
//     יחד עם החתימה  header authorization שלו מה jwt כאשר המשתמש שולח בקשה לשרת להתחבר באמצעות שם משתמש וסיסמא -מחלצים את ה   
//לאחר מכן ניגשים לפרטים של המשתמש והשרת בודק אם קיים מזהה למשתמש ששלח את הבקשה
//אם קיים מזהה כזה השרת מחזיר את המשתמש ואם לא מחזיר הודעת שגיאה
//   כל פעם שניקרא לו הוא יחייב את אותה פעולה שנבקש לבצע את האימות הזה LoginRequired האובייקט 
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
          return done(null,false); 
        }
        done(null,user); 
        
      } catch (error) { 
        done(error,false);
        
      }
    }
  )
);
const LoginRequired = passport.authenticate ('jwt',{session:false}); 
module.exports = LoginRequired;
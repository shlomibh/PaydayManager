const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = require("../config/keys").secret;

//  "יצירת סכימה של "משתמש
const UserSchema = new Schema(
  {       //הגדרת שם המשתמש תהיה מורכבת מההגדרות הבאות
    username: {
      type: String, // סוג מחרוזת
      lowercase: true, //אותיות גדולות יהפכו לאותיות קטנות
      required: [true, "cant't be blank"],// שורה שחיב למלאות אותה אחרת יקפוץ הודעה בהתאם
      match: [/^[a-zA-Z0-9]/, "is invalid"], // השם משתמש יהיה בנוי מאותיות באנגלית גדולות או קטנות וממספרים 
      index: true, // כדי לייעל את השאילתות כשנשתמש בשדה זה-חיפוש מהיר
      unique: true //  .שדה ייחודי- כדי למנוע משם משתמש זהה להיכנס לדף שלא שלו.מתבצע באמצעות אימות ייחודי
    },

    firstName: { // שם פרטי 
      type: String, //מסוג מחרוזת
      required: true //שדה שחובה למלא
    },
    lastName: { 
      type: String,
      required: true
    },
    phoneNumber: { //מספר טלפון
      maxlength: 10, //אורכו של מספר הטלפון חייב להיות 10 מספרים
      minlength: 10,
      type: String,
      required: true,
      match: [/^[0-9]/, "Only Number allowed"] // חייב לכלול מספרים בין 0-9 אחרת מוציא הודעה בהתאם
    },
    department: { // מחלקה
      type: String,
      required: true
    },
    role: { //תפקיד
      type: String,
      required: true
    },
    email: {  //דוא״ל
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"], //חייב להיות לפי מבנה של דוא״ל תקין
      index: true,
      unique: true
    },
    id: {  //מספר תעודת זהות
      type: String,
      required: true,
      match: [/^[0-9]{9}$/, "Only Number allowed"] //חייב להכיל 9 ספרות בין 0-9
    },
    hash: { // jwt המתקבל באמצעות hash 
      type: String
    },
    salt: {  // jwt  המתקבל באמצעות salt 
      type: String
    }
  },
  { timestamps: true } // נותן לך חותמת זמן מתי המודל שלנו נוצר וישתנה
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." }); //  במידה והולידציה התבצעה באופן לא תקין תוצג הודאה בהתאם unique שימוש בתוסף כדי לבצע ולידציה בשדה  
//  שש-עשרה ביטים המתקבלים באופן רנדומלי ומומורים להקסא.לאחר מכן מתקבל ה״ערבוב״ של הסיסמא באמצעות הפונקציה   :"salt" הסיסמא המתקבלת מהמשתמש עוברת תהליך של ״ערבוב״.הסיסמא מקבלת 
//מבצעת 10000 איטרציות עד גודל של 512 ביטים באמצעות אלגוריתם שניקרא ,salt,המקבלת 5 פרמטרים-הסיסמא  
//secure hash algoritem
//   hash לאחר מכן מתבע אימות בין הסיסמא שהמשתמש שלח לבין הסיסמא הקיימת בבסיס הנתונים האימות מתבצע בין    
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};
UserSchema.methods.validPassword = function(password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};
//  נירצה לחדש אותה אחת לכמה זמן jwtל token לאחר שיצרנו    
//פונקציה זו מקבלת את התאריך הנוכחי של יצירת הסיסמא ומוסיפה לו עוד 60-ימים-ואחרי זה סיסמא זו תפוג
UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);
// החתימה תהיה בנויה מהדברים הבאים
  return jwt.sign(
    {
      iss:'PayDayManager',// who do it
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000) // הזמן שנוצר החתימה
    },
    secret
  );
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this,
    department: this.department,
    token: this.generateJWT(),
  };
};

const User = mongoose.model("User", UserSchema); // המשתמש נירשם בבסיס הנתונים

module.exports = User;

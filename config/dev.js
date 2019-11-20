//התחברות לבסיס נתונים-מונגו
mongoDbPass = "HACbKMQdowghJLqL";
module.exports = {
  mongoURI: `mongodb+srv://admin:${mongoDbPass}@pmdb-eryzv.mongodb.net/test?retryWrites=true`,
  //בודק באיזה מצב סביבת עבודה המפתח נימצא ומונע מאחרים לראות את הסיסמא לבסיס הנתונים ושומר את זה בסיקרט וכך אחרים לא יכולים להיכנס לראות את הנתונים
  secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "secret"
};

//התחברות לבסיס נתונים-מונגו
mongoDbPass = "HACbKMQdowghJLqL";
module.exports = {
  mongoURI: `mongodb+srv://admin:${mongoDbPass}@pmdb-eryzv.mongodb.net/test?retryWrites=true`,
  //    השימוש בזה יתבצע רק כשיצרנו סיסמא כדי להצפין אות. dev הצפנה-בודק באיזה מצב סביבת עבודה אנו נמצאים-אנו נמצאים תמיד במצב של   
  secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "secret"
};

    
if (process.env.NODE_ENV === "production") {
  module.exports = require("./prod");
} else {
  module.exports = require("./dev");
}
//טוען סביבת עבודה שונה-אם אנו בסביבת עבודה של פיתוח או סביבת עבודה של פרודקשיין
//     שהיא מרימה את המערכת npm start במהלך הפרוייקט היתי בסביבת פיתוח דרך הויזואל קוד(תוכנה זו שתמיד השתמשתי בפעולה   
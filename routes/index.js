const router = require("express").Router();
router.use("/users", require("./users"));
router.use("/shifts", require("./shifts"));
router.use("/statistics", require("./statistics"));

module.exports = router;

// וכל אחת מנותבת לפי התיקיה המבוקשת   URL שמקבלות כתובות   http  בקשות   
//    לפי משמרות,סטטיסטיקה ומשתמשים httpנועדה לחלק את הבקשות  index תיקיית ה 
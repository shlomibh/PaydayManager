const router = require("express").Router();
const shiftsController = require('../controllers/ShiftsController');
router.route("/:id").post(shiftsController.postShift);
router.route("/submit/:id").post(shiftsController.submitAll);
router.route("/:id").get(shiftsController.getShifts);
router.route("/:id/m=:month/y=:year").get(shiftsController.getShiftsPerMonth);
router.route("/:id").delete(shiftsController.deleteShift);
router.route("/lector-shifts/:id").get(shiftsController.getShiftsPerMonthAndLector)

module.exports = router;

//// וכל אחת מנותבת לפי הכתובת שקבלה ולפי זה משתמשת בפונקציה הקיימת באותו קונטרולר  URL שמקבלות כתובות   http  בקשות   
// תיקיה זו מתייחסת לכל מה שקשור לדיווח משמרת
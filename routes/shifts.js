const router = require("express").Router();
const shiftsController = require('../controllers/ShiftsController');
router.route("/:id").post(shiftsController.postShift);
router.route("/submit/:id").post(shiftsController.submitAll);
router.route("/:id").get(shiftsController.getShifts);
router.route("/:id/m=:month/y=:year").get(shiftsController.getShiftsPerMonth);
router.route("/:id").delete(shiftsController.deleteShift);


module.exports = router;
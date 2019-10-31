const router = require("express").Router();
const shiftsController = require('../controllers/ShiftsController');
router.route("/:id").post(shiftsController.postShift);
router.route("/:id").get(shiftsController.getShifts);
router.route("/:id").delete(shiftsController.deleteShift);


module.exports = router;
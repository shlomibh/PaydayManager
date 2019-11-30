const router = require("express").Router();
const statsController = require('../controllers/statsController');
router.route("/lectors/m=:month/y=:year").get(statsController.lectorStats);
router.route("/department/m=:month/y=:year").get(statsController.departmentStats);

module.exports = router;
const router = require("express").Router();
const statsController = require('../controllers/statsController');
router.route("/lectors/q=:query/m=:month/y=:year").get(statsController.lectorStats);
router.route("/department/q=:query/m=:month/y=:year").get(statsController.departmentStats);

module.exports = router;
const router = require("express").Router();
const statsController = require('../controllers/statsController');
router.route("/lectors/q=:query/m=:month/y=:year").get(statsController.lectorQueryMiddleware);
router.route("/department/q=:query/m=:month/y=:year").get(statsController.departmentQueryMiddleware);

module.exports = router;
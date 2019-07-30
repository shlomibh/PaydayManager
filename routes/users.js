const router = require("express").Router();
const userController = require ('../controllers/UsersController');
router.route('/login',userController.login);

module.exports = router;
const router = require("express").Router();
const LoginRequired = require ('../config/passport');
const userController = require ('../controllers/UsersController');
router.route('/login').post(userController.login);
router.route ('/protected').get(LoginRequired,  (req,res) => {
    res.send('OK');
});

module.exports = router;
const router = require("express").Router();
// const LoginRequired = require ('../config/passport');
const shiftController = require('../controllers/ShiftsController');
router.route('').post(shiftController.login);
// router.route ('/protected').get(LoginRequired,  (req,res) => {
//     res.send('OK');
// });

module.exports = router;
const router = require("express").Router();
const LoginRequired = require ('../config/passport');
const userController = require ('../controllers/UsersController');
router.route('/login').post(userController.login);
router.route('/register').post(userController.register);
router.route('/users-department/:id').get(userController.getUsersDepartment);
router.route('/user/:id').get(userController.getUserDetailsById);
router.route('/update-user').post(userController.updateUser);
router.route ('/protected').get(LoginRequired,  (req,res) => {
    res.send('OK');
});

module.exports = router;

//  וכל אחת מנותבת לפי התיקיה המבוקשת ומשתמשת בפונקציה הקיימת בקונטרולר  URL שמקבלות כתובות   http  בקשות   
// תיקיה זו מתיחחסת לכל מה שקשור לפונקציונאליות של משתמשים
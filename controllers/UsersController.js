const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');

// בדיקת התחברות המשתמש באמצעות דוא״ל וסיסמא
async function login(req, res, next) {
    try {
        const {
            email,
            password
        } = req.body;
        console.log(email, password);
        const user = await User.findOne({
            email
        }); //מחפש אלמנט אחד-דוא״ל של המשתמש
        // בודק האם הדוא״ל של המשתמש או הסיסמא שרשם תקינים
        if (!user || !user.validPassword(password)) {
            return res.status(httpCodes.UNAUTHORIZED).send("email or password not valid"); // אם לא-מחזיר הודעה בהתאם
        } else {
            const token = await user.generateJWT(); //   של המשתמש באמצעות פונקציה token  מחזיר את ה 
            const credentialToRet = { //פררטי המשתמש
                id: user._id,
                username: user.username,
                role: user.role,
                token
            }
            // מחזיר הודעה בהתאם שההתחברות תקינה
            return res.status(httpCodes.OK).send(credentialToRet);
        }
    } catch (error) { // מחזיר הודעת שגיאה במידה ויש בעיה אחרת
        next(error);
    }
}
//כנישלחת בקשה לשרת להוספת משתמש חדש השרת בודק אם קיים אימייל שכבר קיים 
async function register(req, res, next) {
    try {
        const employee = req.body.employee; //ה״עובד החדש״ שנישלח לשרת
        const user = await User.findOne({ // בודק את האימייל שרשם המשתמש החדש
            email: employee.email
        }); 
        
        if (user) { // אם קיים אימייל כזה מוציא הודעה בהתאם
            return res.status(httpCodes.CONFLICT).send("user already existed"); // 
        } else {
            const employeeFromDb = await User.create(employee); // אחרת יוצא ״עובד חדש״ ומכניס אותו לבסיס הנתונים
            if (!employeeFromDb) { // במידה והית קיימת בעיה להכניס אותו לבסיס הנתונים מוציא הודעה בהתאם
                return res.status(httpCodes.CONFLICT).send("cannot insert employee");
            }
            employeeFromDb.setPassword(employee.password); // לסיסמא שרשם המשתמש החדש  jwt יצירת
            employeeFromDb.generateJWT();
            employeeFromDb.save();
           
            return res.status(httpCodes.OK).send(employeeFromDb); // מחזיר הודעת תקינות
        }
    } catch (error) { //מחזיר הודעת שגיאה
        next(error);
    }
}

// פונקציה שמחזירה את המחלקה אליה שייך המרצה
async function getUsersDepartment(req, res, next) {
    try {
        const id = req.params.id; //תעודת זהות של המשתמש ששלח בקשה
        console.log(id);

        const user = await User.findOne({
            _id: id
        }); // בודק את תעודת זהות המתקבלת ומחפש אותה
        if (!user) { //אם המשתמש לא קיים מחזיר הודעה בהתאם
            return res.status(httpCodes.UNAUTHORIZED).send("no such user");
        }
        const usersDepartment = await User.find({
            department: user.department
        }); // מכניס למשתנה אם המחלקה אליה שייך המשתמש-במידה וההתחברות תקינה
        if (!usersDepartment) // אם לא מצא מחלקה מחזיר הודעת שגיאה בהתאם ואם מצא-מחזיר את המחלקה אליה שייך
            return res.status(httpCodes.CONFLICT).send("can't be empty department");
        const lectorsDepartment = usersDepartment.filter(u => u.role === 'lector');
        if (!lectorsDepartment)
            return res.status(httpCodes.CONFLICT).send("there are no lectors in this department");
        return res.status(httpCodes.OK).send(lectorsDepartment);
    } catch (error) {
        next(error);
    }
}

// פונקציה שמחזירה את פרטי המשתמש באמצעות תעודת זהות
async function getUserDetailsById(req, res, next) {
    try {
        const id = req.params.id;// תעודת זהות המשתמש הנוכחי
        console.log(id);

        const user = await User.findOne({ //בודק אם קיים משתמש לפי התעודת הזהות שנמצאה
            _id: id
        }); // 
        if (!user) {  // אם לא קיים משתמש כזה מחזיר ״ריק״
            return null;
        }
        return res.status(httpCodes.OK).send(user); //אחרת מחזיר את המשתמש במידה ונימצא
    } catch (error) {
        next(error);
    }
}
//עדכון פרטי המשתמש הנוכחי-ניתן לעדכן רק מספר טלפון,תפקיד או מחלקה 
async function updateUser(req, res, next) {
    try {
        const user = req.body.employee; //המשתמש הנוכחי הנמצא 
        console.log(user);

        const userFromDb = await User.findOne({  //מציאת משתמש קיים לפי תעודת הזהות של המשתמש הנוכחי
            _id: user.id
        }); 
        if (!userFromDb) { //אם לא קיים מספר תעודת זהות כזו מחזיר הודעה שגיאה
            return res.status(httpCodes.FORBIDDEN);
        }// עדכון הפרטים שניבחרו לצורך שינוי ע״י המשתמש ושמירתם והחזרת הודעת תקינות
        userFromDb.phoneNumber = user.phoneNumber;
        userFromDb.role = user.role;
        userFromDb.department = user.department;
        console.log(userFromDb);
        userFromDb.save();
        
        return res.status(httpCodes.OK).send(userFromDb);
    } catch (error) {
        next(error);
    }
}

// פונקציה שמחזירה רק משתמשים שהם מרצים
async function getLectors(req, res, next) {
    try {
        const users = await User.find(); // חיפוש משתמשים בכללי
        if (!users) { // אם לא קיים מחזיר ״ריק״
            return null;
        }
        const lectors = users.filter( s => s.role === 'lector'); // מסנן משתתמשים שהתפקיד שלהם הוא ״מרצה״ ומחזיר אותם
        return lectors;
    } catch (error) {
        next(error);
    }
}


//הכרזה וייצוא של הפונקציות
const usersControllers = {
    login,
    register,
    getUsersDepartment,
    getUserDetailsById,
    updateUser,
    getLectors
};
module.exports = usersControllers;
const httpCodes = require('http-status-codes');
const User = require('../models/Users');
// בדיקת התחברות המתמש באמצעות דוא״ל וסיסמא
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        console.log(email, password);

        
        const user = await User.findOne({ email });  //מחפש אלמנט אחד-דוא״ל של המשתמש
        // בודק האם הדוא״ל של המשתמש או הסיסמא שרשם תקינים
        if (!user || !user.validPassword(password)) {
            return res.status(httpCodes.UNAUTHORIZED).send("email or password not valid"); // אם לא-מחזיר הודעה בהתאם
        } else {
            const token = await user.generateJWT(); //   של המשתמש באמצעות פונקציה token  מחזיר את ה 
            const credentialToRet = {  //פררטי המשתמש
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
// פונקציה שמחזירה את המחלקה אליה שייך המרצה
async function getUsersDepartment(req, res, next) {
    try {
        const id = req.params.id;  //תעודת זהות של המשתמש ששלח בקשה
        console.log(id);

        const user = await User.findOne({ _id: id }); // בודק את תעודת זהות המתקבלת ומחפש אותה
        if (!user) {  //אם המשתמש לא קיים מחזיר הודעה בהתאם
            return res.status(httpCodes.UNAUTHORIZED).send("no such user");
        }
        const usersDepartment = await User.find({ department: user.department });  // מכניס למשתנה אם המחלקה אליה שייך המשתמש-במידה וההתחברות תקינה
        if(!usersDepartment) // אם לא מצא מחלקה מחזיר הודעת שגיאה בהתאם ואם מצא-מחזיר את המחלקה אליה שייך
            return res.status(httpCodes.CONFLICT).send("can't be empty department");
        return res.status(httpCodes.OK).send(usersDepartment);
    } catch (error) {
        next(error);
    }
}
//הכרזה וייצוא של הפונקציות
const usersControllers = {
    login,
    getUsersDepartment
};
module.exports = usersControllers;
const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');
// דיווח על משמרת
// async function postShift(req, res, next) {
//     try {
//         const shift = req.body.shift; // משמרת המשתמש
//         const id = shift.employeeId; //תעודת זהות של המשתמש שדיווח משמרת
//         const user = await User.findOne({  //מציאת המשתמש לפי תעודת הזהות שלו
//             _id: id
//         });
//         if (!user) return res.status(httpCodes.CONFLICT).send("there is no such user"); // בודק אם קיים משתמש כזה לפי תעודת זהות שלו
//         const department = user.department; //מחלקה אליה שייך המשתמש
//         shift.department = department; //המחלקה של אותו דיווח
//         shift.submitted = false; // דווח של ראש מחלקה על מרצה שדיווח בזמן
//         shift.lectorSubmitted = false;
//         shift.dateLectorSubmit= '';
//         console.log(shift);
//         const shiftFromDb = await Shift.create(shift); //משמרות הקיימות-מבסיס הנתונים
//         if (!shiftFromDb) return res.status(httpCodes.FORBIDDEN).send("cannot create this shift"); //אם המשמרת לא קיימת בבסיס הנתונים מוציא הודעה בהתאם
//         console.log(shiftFromDb);
//         return res.status(httpCodes.OK).send(shiftFromDb); // אם הכל תקין מחזיר את הדיווח של המשמרת
//     } catch (error) {
//         next(error);
//     }
// }

async function postShift(req, res, next) {
    try {
        const shift = req.body.shift;
        const id = shift.employeeId;
        let ans;
        const user = await User.findOne({
            _id: id
        });
        if (!user) return res.status(httpCodes.CONFLICT).send("there is no such user");
        const department = user.department;
        shift.department = department;
        existedShift = await Shift.find({ employeeId: shift.employeeId, date: shift.date });
        if(existedShift.length > 0){
            if(shift.absent === "חופש" || shift.absent === "מחלה") { //if we want to add absent shift
                existedShift.forEach(element => {
                    if(element) return res.status(httpCodes.FORBIDDEN).send("there is shifts in this date");
                });
            }
            else {
                existedShift.forEach(element => {
                    if(element.absent === "מחלה" || element.absent === "חופש")
                        return res.status(httpCodes.FORBIDDEN).send("the user absent in this day");
                    else{
                        if(element._id !== shift._id){
                            ans = checkHourValidation(res, element, shift);
                            if(!ans){
                                return res.status(httpCodes.CONFLICT).send("hours error");
                            } 
                        }
                       }
                });
            }
        }
        console.log('existedShift');
        console.log(existedShift);
        if(ans || existedShift.length < 1){
            const shiftFromDb = await Shift.create(shift);
            console.log(shiftFromDb);
            if (!shiftFromDb) return res.status(httpCodes.FORBIDDEN).send("cannot create this shift");
            return res.status(httpCodes.OK).send(shiftFromDb);
        } 
        
    } catch (error) {
        next(error);
    }
}

//קבלת משמרות
async function getShifts(req, res, next) {
    try {
        const employeeId = req.params.id; //תעודת זהות של המשתמש 
        const shifts = await Shift.find({
            employeeId: employeeId  //המשמרת של אותו משתמש לפי הת״ז שלו
        });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts to that employee"); // אם אין משמרות מחזיר הודעה בהתאם
        console.log(shifts);
        return res.status(httpCodes.OK).send(shifts); // אחרת מחזיר הודעת תקינות ומחזיר את המשמרת
    } catch (error) {
        next(error);
    }
}
// מחזיר משמרת לפי חודש ושנה
    async function getShiftsPerMonth(req, res, next) {
        try {
            const employeeId = req.params.id; //תעודת זהות של המשתמש
            const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
            const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
            const shifts = await Shift.find({  //מוצא את המשמרות של אותו משתמש לפי הת״ז שלו
                employeeId: employeeId
            });
            if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts to that employee"); // אם אין משמרות מחזיר הודעת שגיאה
            const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
            console.log(filterredShifts);
            return res.status(httpCodes.OK).send(filterredShifts);// מחזירה הודעת תקינות ואת כל המשמרות של אותו חודש
        } catch (error) {
            next(error);
        }
    }

    async function submitAll(req, res, next) {
        try {
           const employeeId = req.body.employeeId; // משמרת המשתמש 
           const {month , year} = req.body.date;
           const user = await User.findOne({  //מציאת המשתמש לפי מספר הזדהות שלו
                _id: employeeId
           });
            if (!user) return res.status(httpCodes.CONFLICT).send("there is no such user"); // בודק אם קיים משתמש כזה לפי תעודת זהות שלו
            const role = user.role;
           const shifts = await Shift.find({ employeeId: employeeId });
           if(!shifts) return res.status(httpCodes.CONFLICT).send("no shifts");
           const filterredShiftsbyMonth = shifts.filter( s => s.date.split('/')[0] === `${month}`);
           const filterredShifts = filterredShiftsbyMonth.filter( s => s.date.split('/')[2] === `${year}`);
           filterredShifts.forEach(element => {
               if(element.lectorSubmitted === false){
                if(role === 'lector'){
                    element.lectorSubmitted = true;
                    element.dateLectorSubmit = new Date().toLocaleDateString();
                }
                else{
                        element.lectorSubmitted = true;
                        if(element.dateLectorSubmit === '')
                            element.dateLectorSubmit = new Date().toLocaleDateString();
                        element.submitted = true;
                        element.save();
                }
            }
                
           });
            return res.status(httpCodes.OK).send(true); // אם הכל תקין מחזיר את הדיווח של המשמרת
        } catch (error) {
            next(error);
        }
    }

//מחיקת עדכון של המשתמש
async function deleteShift(req, res, next) {
    try {
        const shiftId = req.params.id; //תעודת זהות של אותו משתמש
        const shift = await Shift.findOne({  //המשמרת של אותו משתמש
            _id: shiftId
        });
        if (!shift) return res.status(httpCodes.FORBIDDEN).send("There is no such shift"); //אם אין משמרת מוציא הודעה בהתאם
        console.log(shift);
        await Shift.deleteOne({  //מחיקת המשמרת של אותו משתמש
            _id: shift._id
        });
        return res.status(httpCodes.NO_CONTENT).send("success"); //מחזיר הודעה שהפעולה הצליחה
    } catch (error) {
        next(error);
    }
}

function checkHourValidation(res, element, shift) {
    const startFromDb = element.start;
    const endFromDb = element.end;
    if(!checkHours(startFromDb, shift.start)) {
        return false;
    }
    else if(!checkHours(endFromDb, shift.end)){
        return false;
    }
    else if(!checkHours(endFromDb, shift.start)){
        return false;
    }
    return true;
}

function checkHours(existed, toAdd) {
    const splitedExisted = existed.split(':');
    const splitedToAdd = toAdd.split(':');
    if(+splitedExisted[0] > +splitedToAdd[0]){
      return false;
    }
    else if(+splitedExisted[0] === +splitedToAdd[0] && +splitedExisted[1] > +splitedToAdd[1]){
        return false;
      }
    else if(+splitedExisted[0] === +splitedToAdd[0] && +splitedExisted[1] === +splitedToAdd[1]){
        return false;
    }
    return true;
  }


// הכרזה על הפונקציות
const shiftsControllers = {
    postShift,
    getShifts,
    getShiftsPerMonth,
    submitAll,
    deleteShift
};
module.exports = shiftsControllers
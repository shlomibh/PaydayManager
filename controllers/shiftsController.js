const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');

//     דיווח על משמרת חדשה
async function postShift(req, res, next) {
    try {
        const shift = req.body.shift;
        const id = shift.employeeId; //מזהה אובייקט
        let ans; // משתנה שיקבל אמת או שקר מהפונקציה שתבדוק את תקינות השעות שמילא המשתמש
        const user = await User.findOne({  //מציאת המשתמש וכל פרטיו לפי המזהה  שלו
            _id: id
        });
        if (!user) return res.status(httpCodes.CONFLICT).send("there is no such user"); // אם לא קיים משתמש כזה מחזיר הודעה בהתאםה
        const department = user.department; //    המחלקה אליה שייך המשתמש והצבתו באובייקט של המשמרת     
        shift.department = department;
        shift.lectorSubmitted = false;//משתנה בוליאני-אם המרצה אישר את השעות או לא-בהתחלה הוא שקר-לא אישר את השעות
        shift.submitted = false;// משתנה בוליאני-אם ראש המחלקה אישר את השעות או לא-בהתחלה הוא שקר -הראש מחלקה לא אישר את השעות
        shift.dateLectorSubmit = '';// התאריך בו אישר המרצה את דיוחח השעות
        existedShift = await Shift.find({ employeeId: shift.employeeId, date: shift.date }); //מחפש את המשמרות הקיימות לפי המזהה של האובייקט של המשמרת והתאריך שניבחר
        if(existedShift.length > 0){ //בדיקה שאכן קיימת לפחות משמרת
            //טיפול בשתי מקרי קיצון שלא יכולים לקרות-המערכת רצה על כל איברי המערך-המשמרות-אם המשתמש דיווח על משמרת באותו יום ולאחר מכן רוצה לדווח על מחלה או חופש באותו תאריך המערכת תחזיר הודעת שגיאה ותדפיס שקימיים משמרות בתאריך הזה-מרצה לא יכול לדווח שהיה נוכח בעבודה וגם במחלה או בחופש
            //המקרה השני שיחזיר הודעת שגיאה זה במידה והמשתמש בחר תאריך ודיווח מחלה או חופש ואחרי זה בחר את את אותו תאריך ורצה לדווח על משמרת-דבר זה גם לא הגיוני
            if(shift.absent === "חופש" || shift.absent === "מחלה") { 
                existedShift.forEach(element => {
                    if(element) return res.status(httpCodes.FORBIDDEN).send("there is shifts in this date");
                });
            }
            else {
                existedShift.forEach(element => {
                    if(element.absent === "מחלה" || element.absent === "חופש")
                        return res.status(httpCodes.FORBIDDEN).send("the user absent in this day");
                    else{
                        if(element._id !== shift._id){ // אם לא מדובר באותה משמרת
                            ans = checkHourValidation(element, shift); // משתנה שמקבל אמת או שקר לגבי תקינות השעות שדיווח
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
        // אם תקינות השעות שדיווח תקינות או שאין בכלל משמרות-דף ריק
        // המערכת יוצרת משמרת חדשה ושולחת לבסיס הנתונים במידה ויש בעיה שולח הודעה בהתאם
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

//         קבלת משמרות (הקיימות כבר בשרת
async function getShifts(req, res, next) {
    try {
        const employeeId = req.params.id; // מזהה האובייקט של העובד 
        const shifts = await Shift.find({  // מציאת כל המשמרות לפי התעודת זהות של המשתמש
            employeeId: employeeId   
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
            const employeeId = req.params.id; //מזהה האובייקט של העובד
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
// פונקציה שבודקת אם המשתמש -המרצה-אישר את כל המשמרות ושומרת את התאריך שאישר
    async function submitAll(req, res, next) {
        try {
           const employeeId = req.body.employeeId; //תעודת זהות של המשתמש
           const {month , year} = req.body.date; // תאריך אותו בחר המשתמש
           const user = await User.findOne({  //מציאת המשתמש לפי מספר הזדהות שלו
                _id: employeeId
           });
            if (!user) return res.status(httpCodes.CONFLICT).send("there is no such user"); // אם אין משתמש כזה מחזיר הודעה התאם
            const role = user.role; //תפקיד המשתמש-מרצה או ראש מחלקה או מנהל שכר
           const shifts = await Shift.find({ employeeId: employeeId }); //מציאת כל המשמרות לפי תיודת זהות המשתמש
           if(!shifts) return res.status(httpCodes.CONFLICT).send("no shifts"); // אם לא קיים מוציא הודעה בהתאם
           const filterredShiftsbyMonth = shifts.filter( s => s.date.split('/')[0] === `${month}`); //סינון לכל המשמרות אותם בחר המשתמש לפי חודש ושנה
           const filterredShifts = filterredShiftsbyMonth.filter( s => s.date.split('/')[2] === `${year}`);
           filterredShifts.forEach(element => {
               if(element.lectorSubmitted === false){  // משתנה בוליאני שבודק אם המרצה אישר את המשמרות שלו
                    if(role === 'lector'){
                        element.lectorSubmitted = true; // בודק אם תפקיד המשתמש הנוכחי הוא מרצה אם כן המשתנה הבוליאני הופך לאמת
                        element.dateLectorSubmit = new Date().toLocaleDateString(); // התאריך אותו אישר המרצה את המשמרות שלו לפי התאריך הנוכחי שבמחשב
                    }
                    else{                                  // מצב שבו המשתנה הבוליאני אמת
                            element.lectorSubmitted = true;
                            if(element.dateLectorSubmit === '' || element.dateLectorSubmit === undefined) // אם התאריך של אישור הדיווחים של המרצה ריק
                                element.dateLectorSubmit = new Date().toLocaleDateString(); // מכניס את התאריך הנוכחי
                            element.submitted = true; //המשמרות אושר
                    }
                }
                else{
                    element.submitted = true;
                }
                element.save(); //שמירה
           });

            return res.status(httpCodes.OK).send(true); // מחזיר הודעה שהכל תקין
            
        } catch (error) {
            next(error);
        }
    }

    async function getShiftsPerMonthAndLector(req, res, next) {
        try {
            console.log(req.params.id);
            const employeeId = req.params.id; //מזהה האובייקט של העובד
            const month = (new Date().getMonth() + 1);
            const year = new Date().getFullYear();
            const shifts = await Shift.find({  //מוצא את המשמרות של אותו משתמש לפי הת״ז שלו
                employeeId: employeeId
            });
            console.log(shifts);
            console.log(month, year);
            if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts to that employee"); // אם אין משמרות מחזיר הודעת שגיאה
            const filterredShifts = shifts.filter(s => s.date.split('/')[0] === `${month}`); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
            console.log(filterredShifts);
            const filterByYearShifts = filterredShifts.filter(s => s.date.split('/')[2] === `${year}`);
            console.log(filterByYearShifts);
            return res.status(httpCodes.OK).send(filterByYearShifts);// מחזירה הודעת תקינות ואת כל המשמרות של אותו חודש
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
//בדיקת תקינות הזנת השעות
function checkHourValidation( element, shift) {
    const startFromDb = element.start; // תחילת שעת העבודה ששלח המשתמש
    const endFromDb = element.end; //סיום שעת העבודה ששלח המשתמש
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
// פונקציה שבודקת אם השעות שהוזנו חוקים
function checkHours(S_hour, E_hour) {
    const starthour = S_hour.split(':'); //        שעת התחלה-שימוש בפונקציה שתחלק לנו את שעת ההתחלה לשעות ודקות
    const endhour = E_hour.split(':');//שעת סוף-שימוש בפונקציה שתחלק לנו את השעה לפי שעות ודקות
    if(+starthour[0] > +endhour[0]){ //בודק את שעת ההתחלה-אם השעה יותר גדולה משעת הסוף-דבר שאינו הגיוני ולכם מחזיר שקר
      return false;
    }
    else if(+starthour[0] === +endhour[0] && +starthour[1] > +endhour[1]){ // בודק אם שעת ההתחלה שווה לשעת הסוף אבל אם הדקות בשעת ההתחלה יותר גדולות מדקות של שעת הסיום הדבר אינו הגיוני ולכן מחזיר שקר
        return false;
      }
    else if(+starthour[0] === +endhour[0] && +starthour[1] === +endhour[1]){ // מצב שבו שעת ההתחלה וגם הדקות שוות לשעת הסוף וגם לדקות-דבר אינו הגיוני ולכן מחזיר שקר
        return false;
    }
    return true; // אם מצבים אלו לא קרו מחזיר אמת
  }


// הכרזה על הפונקציות
const shiftsControllers = {
    postShift,
    getShifts,
    getShiftsPerMonth,
    getShiftsPerMonthAndLector,
    submitAll,
    deleteShift
};
module.exports = shiftsControllers
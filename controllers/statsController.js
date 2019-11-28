const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');

async function lectorQueryMiddleware(req, res, next) {
    try {
        const query = req.params.query; //תעודת זהות של המשתמש
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
        //const shifts = await Shift.find({  //מוצא את המשמרות של אותו משתמש לפי הת״ז שלו
        //    employeeId: employeeId
        //});
        //if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts to that employee"); // אם אין משמרות מחזיר הודעת שגיאה
        //const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
        //console.log(filterredShifts);
        console.log(query, month, year);
        switch(query){
            case 'canceled':
                const result = lectorCanceledStats(month, year);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            case 'sickness':
                const result = lectorCanceledStats(month, year);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            case 'dayoff':
                const result = lectorCanceledStats(month, year);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            case 'extraHours':
                const result = lectorCanceledStats(month, year);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            case 'inTime':
                const result = lectorCanceledStats(month, year);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            default:
                return res.status(httpCodes.BAD_REQUEST).send("wrong input");
        }
        return res.status(httpCodes.OK);
    } catch (error) {
        next(error);
    }
}
async function lectorCanceledStats(month, year) {

}

async function departmentQueryMiddleware(req, res, next) {
    try {
        const query = req.params.query; //תעודת זהות של המשתמש
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
        //const shifts = await Shift.find({  //מוצא את המשמרות של אותו משתמש לפי הת״ז שלו
        //    employeeId: employeeId
        //});
        //if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts to that employee"); // אם אין משמרות מחזיר הודעת שגיאה
        //const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
        //console.log(filterredShifts);
        console.log(query, month, year);
        switch(query){
            case 'canceled':
                //call function
            case 'sickness':
            case 'dayoff':
            case 'extraHours':
            case 'inTime':
            default:
            return res.status(httpCodes.BAD_REQUEST).send("wrong input");
        }
        return res.status(httpCodes.OK);
    } catch (error) {
        next(error);
    }
}

const statsControllers = {
    lectorQueryMiddleware,
    departmentQueryMiddleware
};
module.exports = statsControllers

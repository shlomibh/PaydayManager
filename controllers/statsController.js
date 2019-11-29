const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');


async function lectorStats(req, res, next) {
    try {
        const query = req.params.query; //תעודת זהות של המשתמש
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
        const shifts = await Shift.find({ submitted: true });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year);
        
        switch(query){
            case 'canceled':
                const canceledRes = canceledStats('lector', filteredShifts);
                if(!canceledRes) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(canceledRes);
            case 'sickness':
                const sicknessRes = sicknessStats('lector', filteredShifts);
                if(!sicknessRes) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(sicknessRes);
            case 'dayoff':
                const dayoffRes = dayoffStats('lector', filteredShifts);
                if(!dayoffRes) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(dayoffRes);
            case 'extraHours':
                const extraHoursRes = extraHoursStats('lector', filteredShifts);
                if(!extraHoursRes) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(extraHoursRes);
            case 'inTime':
                const inTimeRes = inTimeStats('lector', filteredShifts);
                if(!inTimeRes) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(inTimeRes);
            default:
                return res.status(httpCodes.BAD_REQUEST).send("wrong input");
        }
    } catch (error) {
        next(error);
    }
}

async function departmentStats(req, res, next) {
    try {
        const query = req.params.query; //תעודת זהות של המשתמש
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
       
        const shifts = await Shift.find({ submitted: true });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year);
        
        switch(query){
            case 'canceled':
                const result = canceledStats('department', filteredShifts);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            case 'sickness':
                const result = sicknessStats('department', filteredShifts);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            case 'dayoff':
                const result = dayoffStats('department', filteredShifts);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            case 'extraHours':
                const result = extraHoursStats('department', filteredShifts);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            case 'inTime':
                const result = inTimeStats('department', filteredShifts);
                if(!result) return res.status(httpCodes.CONFLICT).send("no shifts");
                return res.status(httpCodes.OK).send(result);
            default:
                return res.status(httpCodes.BAD_REQUEST).send("wrong input");
        }
    } catch (error) {
        next(error);
    }
}

function getFilteredShifts(shifts, month, year) {
    
    const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
    if(!filterredShifts) 
        return res.status(httpCodes.FORBIDDEN).send("no shifts");
    const dateFillteredShifts = filterredShifts.filter(s => s.date.split('/')[2] === year);
    if(!dateFillteredShifts) 
        return res.status(httpCodes.FORBIDDEN).send("no shifts");
    //console.log(dateFillteredShifts);
    return dateFillteredShifts;
}

async function canceledStats(identify, shifts) {
    let max;
    let maxID;
    let min;
    let minID;
    const canceledShifts = shifts.filter(s => s.absent === 'ביטול');
    console.log(canceledShifts);
}

async function sicknessStats(identify, shifts) {
    let max;
    let maxID;
    let min;
    let minID;
    const sickShifts = shifts.filter(s => s.absent === 'מחלה');
    console.log(sickShifts);
}

async function dayoffStats(identify, shifts) {
    let max;
    let maxID;
    let min;
    let minID;
    const offShifts = shifts.filter(s => s.absent === 'חופש');
    console.log(offShifts);
}

async function extraHoursStats(identify, shifts) {
    let max;
    let maxID;
    let min;
    let minID;
    //const extraShifts = shifts.filter(s => s.absent === 'ביטול'); 
    //need to calculate by user or department
}

async function inTimeStats(identify, shifts) {
    let max;
    let maxID;
    let min;
    let minID;
    //const inTimeShifts = shifts.filter(s => s.absent === 'ביטול');
}

const statsControllers = {
    lectorStats,
    departmentStats
};
module.exports = statsControllers

const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');
const userController = require('./UsersController');

async function lectorStats(req, res, next) {
    try {
        const query = req.params.query; //תעודת זהות של המשתמש
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
        const finalArrayResult = [];
        const shifts = await Shift.find({ submitted: true });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year);
        switch(query){
            case 'canceled':
                const canceledShifts = filteredShifts.filter(s => s.absent === 'ביטול');
                if(!canceledShifts) 
                    return res.status(httpCodes.OK).send(null);
                const canceledRes = getStats('lector', canceledShifts);
                if(!canceledRes) 
                    return res.status(httpCodes.OK).send(null);
                const cmaxUser = await userController.getUserById(req, res, next, canceledRes.maxID);
                const cminUser = await userController.getUserById(req, res, next, canceledRes.minID);
                const cFinalResult = {
                    maxUser: cmaxUser, 
                    maxCount: canceledRes.maxCount,
                    minUser: cminUser,
                    minCount: canceledRes.minCount
                };
                console.log(cFinalResult);
                finalArrayResult.push(cFinalResult);
                return res.status(httpCodes.OK).send(cFinalResult);
            case 'sickness':
                const sickShifts = filteredShifts.filter(s => s.absent === 'מחלה');
                if(!sickShifts) 
                    return res.status(httpCodes.OK).send(null);
                const sickRes = getStats('lector', sickShifts);
                if(!sickRes) 
                    return res.status(httpCodes.OK).send(null);
                const smaxUser = await userController.getUserById(req, res, next, sickRes.maxID);
                const sminUser = await userController.getUserById(req, res, next, sickRes.minID);
                const sFinalResult = {
                    maxUser: smaxUser, 
                    maxCount: sickRes.maxCount,
                    minUser: sminUser,
                    minCount: sickRes.minCount
                };
                console.log(sFinalResult);
                finalArrayResult.push(sFinalResult);
                return res.status(httpCodes.OK).send(sFinalResult);
            case 'dayoff':
                const offShifts = filteredShifts.filter(s => s.absent === 'חופש');
                if(!offShifts) 
                    return res.status(httpCodes.OK).send(null);
                const offRes = getStats('lector', offShifts);
                if(!offRes) 
                    return res.status(httpCodes.OK).send(null);
                    const omaxUser = await userController.getUserById(req, res, next, offRes.maxID);
                    const ominUser = await userController.getUserById(req, res, next, offRes.minID);
                    const oFinalResult = {
                        maxUser: omaxUser, 
                        maxCount: offRes.maxCount,
                        minUser: ominUser,
                        minCount: offRes.minCount
                    };
                    console.log(oFinalResult);
                    finalArrayResult.push(oFinalResult);
                    return res.status(httpCodes.OK).send(oFinalResult);
            case 'extraHours':
                const extraShifts = filteredShifts.filter(s => s.absent === 'שעות נוספות'); //need to create new
                if(!extraShifts) 
                    return res.status(httpCodes.OK).send(null);
                const extraRes = getStats('lector', extraShifts);
                if(!extraRes) 
                    return res.status(httpCodes.OK).send(null);
                    const emaxUser = await userController.getUserById(req, res, next, extraRes.maxID);
                    const eminUser = await userController.getUserById(req, res, next, extraRes.minID);
                    const eFinalResult = {
                        maxUser: emaxUser, 
                        maxCount: extraRes.maxCount,
                        minUser: eminUser,
                        minCount: extraRes.minCount
                    };
                    console.log(eFinalResult);
                    finalArrayResult.push(eFinalResult);
                    return res.status(httpCodes.OK).send(eFinalResult);
                case 'inTime':
                const inTimeShifts = filteredShifts.filter();//s => s.lectorSubmittedDate <= '26/${month}/${year}'); 
                if(!inTimeShifts) 
                    return res.status(httpCodes.OK).send(null);
                const inTimeRes = getStats('lector', inTimeShifts);
                if(!inTimeRes) 
                    return res.status(httpCodes.OK).send(null);
                const itmaxUser = await userController.getUserById(req, res, next, inTimeRes.maxID);
                const itminUser = await userController.getUserById(req, res, next, inTimeRes.minID);
                const itFinalResult = {
                    maxUser: itmaxUser, 
                    maxCount: inTimeRes.maxCount,
                    minUser: itminUser,
                    minCount: inTimeRes.minCount
                };
                console.log(itFinalResult);
                finalArrayResult.push(itFinalResult);
                return res.status(httpCodes.OK).send(itFinalResult);
            
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
                    const canceledShifts = filteredShifts.filter(s => s.absent === 'ביטול');
                    if(!canceledShifts) 
                        return res.status(httpCodes.OK).send(null);
                    const canceledRes = getStats('department', canceledShifts);
                    if(!canceledRes) 
                        return res.status(httpCodes.OK).send(null);
                    return res.status(httpCodes.OK).send(canceledRes);
                case 'sickness':
                    const sickShifts = filteredShifts.filter(s => s.absent === 'מחלה');
                    if(!sickShifts) 
                        return res.status(httpCodes.OK).send(null);
                    const sickRes = getStats('department', sickShifts);
                    if(!sickRes) 
                        return res.status(httpCodes.OK).send(null);
                    return res.status(httpCodes.OK).send(sickRes);
                case 'dayoff':
                    const offShifts = filteredShifts.filter(s => s.absent === 'חופש');
                    if(!offShifts) 
                        return res.status(httpCodes.OK).send(null);
                    const offRes = getStats('department', offShifts);
                    if(!offRes) 
                        return res.status(httpCodes.OK).send(null);
                    return res.status(httpCodes.OK).send(offRes);
                case 'extraHours':
                    const extraShifts = filteredShifts.filter(s => s.absent === 'שעות נוספות'); //need to create new
                    if(!extraShifts) 
                        return res.status(httpCodes.OK).send(null);
                    const extraRes = getStats('department', extraShifts);
                    if(!extraRes) 
                        return res.status(httpCodes.OK).send(null);
                    return res.status(httpCodes.OK).send(extraRes);
                case 'inTime':
                    const inTimeShifts = filteredShifts.filter();//s => s.lectorSubmittedDate <= '26/${month}/${year}'); 
                    if(!inTimeShifts) 
                        return res.status(httpCodes.OK).send(null);
                    const inTimeRes = getStats('department', inTimeShifts);
                    if(!inTimeRes) 
                        return res.status(httpCodes.OK).send(null);
                    return res.status(httpCodes.OK).send(inTimeRes);
            default:
                return res.status(httpCodes.BAD_REQUEST).send("wrong input");
        }
    } catch (error) {
        next(error);
    }
}

function getFilteredShifts(shifts, month, year) {
    month='11';
    const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
    if(!filterredShifts) 
        return res.status(httpCodes.FORBIDDEN).send("no shifts");
    const dateFillteredShifts = filterredShifts.filter(s => s.date.split('/')[2] === year);
    if(!dateFillteredShifts) 
        return res.status(httpCodes.FORBIDDEN).send("no shifts");
    return dateFillteredShifts;
}

function getStats(identify, shifts) {
    let max=0;
    let maxID;
    let min=10000;
    let minID;
    const statList = [];
    let dataToPush = {
        id: String,
        count: Number
    };
    shifts.forEach(element => {
        if(statList.length === 0){
            if(identify === 'lector')
                dataToPush = {id: element.employeeId, count: 1};
            else if(identify === 'department')
                dataToPush = {id: element.department, count: 1};
            statList.push(dataToPush);
        }
        else {
            let flag = false;
            statList.forEach(statElem => {
                if(identify === 'lector') {
                        if(statElem.id === element.employeeId){
                        flag = true;
                        statElem.count ++;
                    }
                }
                else if(identify === 'department') {
                    if(statElem.id === element.department){
                        flag = true;
                        statElem.count ++;
                    }
                }
            });
            if(flag === false){
                if(identify === 'lector')
                    dataToPush = {id: element.employeeId, count: 1};
                else if(identify === 'department')
                    dataToPush = {id: element.department, count: 1};
                statList.push(dataToPush);
            }
        }
    });
    statList.forEach(statElem => {
        if(statElem.count < min && statElem.id !== maxID) {
            min = statElem.count;
            minID = statElem.id;
        }
        if(statElem.count > max) {
            max = statElem.count;
            maxID = statElem.id;
        }
    });
    if(minID === undefined){
        minID = maxID;
        min = max;
    }
    else if(maxID === undefined){
        maxID = minID;
        max = min;
    }
    console.log(statList);
    const res = {maxID: maxID, maxCount: max, minID: minID, minCount: min};
    console.log(res);
    return res;
}


async function extraHoursStats(identify, shifts) {
    let max;
    let maxID;
    let min;
    let minID;
    //const extraShifts = shifts.filter(s => s.absent === 'ביטול'); 
    //need to calculate by user or department
}

const statsControllers = {
    lectorStats,
    departmentStats
};
module.exports = statsControllers

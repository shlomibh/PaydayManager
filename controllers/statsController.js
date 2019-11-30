const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');
const userController = require('./UsersController');

async function lectorStats(req, res, next) {
    try {
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
        const finalArrayResult = [];
        const shifts = await Shift.find({ submitted: true });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year);

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
        finalArrayResult.push(cFinalResult);

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
        finalArrayResult.push(sFinalResult);
    
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
        finalArrayResult.push(oFinalResult);

    // FOR NOW!!! //
    const submittedShifts = filteredShifts.filter(s => s.submitted === true );
    const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`${month}/26/${year}`));
    const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`${month}/26/${year}`));
    // const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`11/26/${year}`));    //oren
    // const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`11/26/${year}`));  //oren
    if(!inTimeShifts)
        return res.status(httpCodes.OK).send(null);
    const inTimeRes = getStats('lector', inTimeShifts);
    if(!inTimeRes) 
        return res.status(httpCodes.OK).send(null);
    const notInTimeRes = getStats('lector', notInTimeShifts);
    if(!notInTimeRes) 
        return res.status(httpCodes.OK).send(null);
    timeRes = {
        maxID: inTimeRes.maxID,
        maxCount: inTimeRes.maxCount,
        minID: notInTimeRes.maxID,
        minCount: notInTimeRes.maxCount
    };
    const itmaxUser = await userController.getUserById(req, res, next, timeRes.maxID);
    const itminUser = await userController.getUserById(req, res, next, timeRes.minID);
    const itFinalResult = {
        maxUser: itmaxUser, 
        maxCount: timeRes.maxCount,
        minUser: itminUser,
        minCount: timeRes.minCount
    };
    console.log(itFinalResult);
    finalArrayResult.push(itFinalResult);
    
    return res.status(httpCodes.OK).send(finalArrayResult);
         
    // case 'extraHours':
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
                //     return res.status(httpCodes.OK).send(eFinalResult);
                
    } catch (error) {
        next(error);
    }
}

async function departmentStats(req, res, next) {
    try {
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
        const finalArrayResult = [];

        const shifts = await Shift.find({ submitted: true });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year);
        
        const canceledShifts = filteredShifts.filter(s => s.absent === 'ביטול');
        if(!canceledShifts) 
            return res.status(httpCodes.OK).send(null);
        const canceledRes = getStats('department', canceledShifts);
        if(!canceledRes) 
            return res.status(httpCodes.OK).send(null);
        finalArrayResult.push(canceledRes);

        const sickShifts = filteredShifts.filter(s => s.absent === 'מחלה');
        if(!sickShifts) 
            return res.status(httpCodes.OK).send(null);
        const sickRes = getStats('department', sickShifts);
        if(!sickRes) 
            return res.status(httpCodes.OK).send(null);
        finalArrayResult.push(sickRes);

        const offShifts = filteredShifts.filter(s => s.absent === 'חופש');
        if(!offShifts) 
            return res.status(httpCodes.OK).send(null);
        const offRes = getStats('department', offShifts);
        if(!offRes) 
            return res.status(httpCodes.OK).send(null);
        finalArrayResult.push(offRes);
        // FOR NOW!!! //
        const submittedShifts = filteredShifts.filter(s => s.submitted === true );
        const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`${month}/26/${year}`));
        const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`${month}/26/${year}`));
        // const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`11/26/${year}`));    //oren
        // const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`11/26/${year}`));  //oren
        if(!inTimeShifts)
            return res.status(httpCodes.OK).send(null);
        const inTimeRes = getStats('department', inTimeShifts);
        if(!inTimeRes) 
            return res.status(httpCodes.OK).send(null);
        const notInTimeRes = getStats('department', notInTimeShifts);
        if(!notInTimeRes) 
            return res.status(httpCodes.OK).send(null);
        timeRes = {
            maxID: inTimeRes.maxID,
            maxCount: inTimeRes.maxCount,
            minID: notInTimeRes.maxID,
            minCount: notInTimeRes.maxCount
        };
        console.log(timeRes);
        finalArrayResult.push(timeRes);
        return res.status(httpCodes.OK).send(finalArrayResult);

        // case 'extraHours':
            const extraShifts = filteredShifts.filter(s => s.absent === 'שעות נוספות'); //need to create new
            if(!extraShifts) 
                return res.status(httpCodes.OK).send(null);
            const extraRes = getStats('department', extraShifts);
            if(!extraRes) 
                return res.status(httpCodes.OK).send(null);
        //     return res.status(httpCodes.OK).send(extraRes);            

    } catch (error) {
        next(error);
    }
}

function getFilteredShifts(shifts, month, year) {
    month='11'; //need to remove!!!!
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
    const res = {maxID: maxID, maxCount: max, minID: minID, minCount: min};
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

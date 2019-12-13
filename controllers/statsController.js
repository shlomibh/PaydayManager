const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');
const userController = require('./UsersController');
const shiftsController = require('./shiftsController');

// .הפונקציה המטפלת בניתוח סטטיסטי של המרצים. הפונקציה מכניסה למערך את כל המשמרות שהם ״אושרו״ ע״י ראש המחלקה ןלפי החודש והשנה אותה בחר המשתמש
//לאחר מכן הפונקציה מסננת את המשמרות שהופיע בהם ״ביטול״
async function lectorStats(req, res, next) {
    try {
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
        const finalArrayResult = [];
        const shifts = await Shift.find({ submitted: true }); //כל הדיווחים שאושרו ע״י ראש המחלקה
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year); // מערך שבו נמצאים משמרות שאושרו ע״י ראש המחלקה,חודש ושנה שנבחרו

        const canceledShifts = filteredShifts.filter(s => s.absent === 'ביטול'); // משמרות שהופיע בהם ביטול
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
    //const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`11/26/${year}`));    //oren
    //const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`11/26/${year}`));  //oren
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
    } catch (error) {
        next(error);
    }
}

async function departmentStats(req, res, next) {
    try {
        const month = req.params.month; // החודש אותו ביקש המשתמש לקבל
        const year = req.params.year; //השנה אותה ביקש המשתמש לבקש
        const finalArrayResultdep = [];

        const shifts = await Shift.find({ submitted: true });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year);
        
        const canceledShifts = filteredShifts.filter(s => s.absent === 'ביטול');
        if(!canceledShifts) 
            return res.status(httpCodes.OK).send(null);
        const canceledRes = getStats('department', canceledShifts);
        console.log(canceledRes);
        if(!canceledRes) 
            return res.status(httpCodes.OK).send(null);
        finalArrayResultdep.push(canceledRes);
        console.log('cancel'); 
        console.log(finalArrayResultdep);
        const sickShifts = filteredShifts.filter(s => s.absent === 'מחלה');
        if(!sickShifts) 
            return res.status(httpCodes.OK).send(null);
        const sickRes = getStats('department', sickShifts);
        if(!sickRes) 
            return res.status(httpCodes.OK).send(null);
        finalArrayResultdep.push(sickRes);
        console.log('sick'); 
        console.log(finalArrayResultdep);
        const offShifts = filteredShifts.filter(s => s.absent === 'חופש');
        if(!offShifts) 
            return res.status(httpCodes.OK).send(null);
        const offRes = getStats('department', offShifts);
        if(!offRes) 
            return res.status(httpCodes.OK).send(null);
        finalArrayResultdep.push(offRes);
        console.log('dayoff'); 
        console.log(finalArrayResultdep);

        // FOR NOW!!! //
        const submittedShifts = filteredShifts.filter(s => s.submitted === true );
        const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`${month}/26/${year}`));
        const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`${month}/26/${year}`));
        //const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`11/26/${year}`));    //oren
        //const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`11/26/${year}`));  //oren
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
        finalArrayResultdep.push(timeRes);
        console.log('inTime'); 
        console.log(finalArrayResultdep);
 
        return res.status(httpCodes.OK).send(finalArrayResultdep);
    } catch (error) {
        next(error);
    }
}

function getFilteredShifts(shifts, month, year) {
   // month='11'; //need to remove!!!!
    const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
    if(!filterredShifts) 
        return res.status(httpCodes.FORBIDDEN).send("no shifts");
    const dateFillteredShifts = filterredShifts.filter(s => s.date.split('/')[2] === year);
    if(!dateFillteredShifts) 
        return res.status(httpCodes.FORBIDDEN).send("no shifts");
    return dateFillteredShifts;
}

function getStats(identify, shifts) {
    let max;
    let maxID;
    let min;
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
    min = max = statList[0].count;
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

async function getShiftsOfLector(lector, dateToSubmit){
    try{
        let flag = false;
        const shifts = await Shift.find({employeeId: lector._id});
        const filterredShifts = getFilteredShifts(shifts, `${new Date().getMonth()+1}`, `${new Date().getFullYear()}`);
      //  console.log(filterredShifts);
        filterredShifts.forEach(element => {
                    if(element.lectorSubmitted === false || element.lectorSubmitted === undefined) {
                        flag = true;
                    }
                    else if(element.dateLectorSubmit > dateToSubmit || element.dateLectorSubmit === undefined){
                        flag = true;
                    }
                });
            console.log(flag);
            return {flag, filterredShifts};
        }
        catch(error){
            console.log(error);
        }
}

async function getLectorsStats(req, res, next) {
    try {
        const lectors = await userController.getLectors(req,res,next);
        if(!lectors){
            return res.status(httpCodes.FORBIDDEN).send("No lectors");
        }
        const dateToSubmit = new Date(`${new Date().getMonth()+1}/26/${new Date().getFullYear()}`).toLocaleDateString();
        console.log(dateToSubmit);
        const delayedLectorsToSend = [];
        const goodLectorsToSend =[];
        lectors.forEach(lector => {
            const {flag, shifts} = getShiftsOfLector(lector, dateToSubmit);
            console.log(flag);
            if (flag === false){
                goodLectorsToSend.push(lector);
                console.log(goodLectorsToSend);
                //console.log('false');
                //console.log(lector.username);
            }
            else if(flag && shifts !== undefined) {
                delayedLectorsToSend.push(lector);
                console.log(delayedLectorsToSend); 
               // console.log('true');
               // console.log(lector.username);
            }
        });
        const dataToSend = {
            goodLectors: goodLectorsToSend,
            delayedLectors: delayedLectorsToSend
        };
        console.log(dataToSend);
        return res.status(httpCodes.OK).send(dataToSend); //מחזיר הודעה שהפעולה הצליחה
    } catch (error) {
        next(error);
    }
}



const statsControllers = {
    lectorStats,
    departmentStats,
    getLectorsStats
};
module.exports = statsControllers

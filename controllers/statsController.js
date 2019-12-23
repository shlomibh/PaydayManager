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
        const shifts = await Shift.find({
            submitted: true
        }); //כל הדיווחים שאושרו ע״י ראש המחלקה
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year); // מערך שבו נמצאים משמרות שאושרו ע״י ראש המחלקה,חודש ושנה שנבחרו

        const canceledShifts = filteredShifts.filter(s => s.absent === 'ביטול'); // משמרות שהופיע בהם ביטול
        if (!canceledShifts) // אם אין משמרות המופיעות כ״ביטול״ מחזיר תוכן הודעה ריק
            return res.status(httpCodes.OK).send(null);
        const canceledRes = getStats('lector', canceledShifts);//  המקבלת משתמש שהוא מרצה ואת כל המשמרות בהם ביטל שיעור get stats() משתמש בפונקציה  
        if (!canceledRes)
            return res.status(httpCodes.OK).send(null); // אם לא קיימות משמרות שביטל
        const cmaxUser = await userController.getUserById(req, res, next, canceledRes.maxID);// מחזיר את כל פרטי המשתמש שהוא המקסימום
        const cminUser = await userController.getUserById(req, res, next, canceledRes.minID);// מחזיר את כל פרטי המשתמש שהוא מינימום
        const cFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
            maxUser: cmaxUser, // שם המשתמש הכי גבוהה
            maxCount: canceledRes.maxCount,// הצגת הנתון הכי גבוהה
            minUser: cminUser,//שם המשתמש הכי נמוך
            minCount: canceledRes.minCount //הצגת הנתון הכי נמוך
        };
        finalArrayResult.push(cFinalResult);// הצגת המערך
// מדובר בפונקציה הדומה לדוגמא הראשונה רק שמתייחסת לניתוח סטטיסטי הקשור ל״מחלה״
        const sickShifts = filteredShifts.filter(s => s.absent === 'מחלה');
        if (!sickShifts)
            return res.status(httpCodes.OK).send(null);
        const sickRes = getStats('lector', sickShifts);
        if (!sickRes)
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
// מדובר בפונקציה הדומה לפונקציה הראשונה רק שמתייחסת לניתוח הסטטיסטי לפי ״חופש״
        const offShifts = filteredShifts.filter(s => s.absent === 'חופש');
        if (!offShifts)
            return res.status(httpCodes.OK).send(null);
        const offRes = getStats('lector', offShifts);
        if (!offRes)
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

        // פונקציה הדומה לפונקציה הראשונה רק שמתייחסת לניתוח הסטטיסטי לפי ״דיווח בזמן או ״דיווח לא בזמן״
        // הגדרה של דיווח בזמן הינה לפי התאריך שבה המשתמש אישר את המשמרות שלו-אם אישר עד ה26 לחודש או לפני דיווח בזמן אם אחרי לא דיווח בזמן
        // מחזיר את פרטי המשתמש שדיווח בזמן /לא דיווח בזמן
        const submittedShifts = filteredShifts.filter(s => s.submitted === true);
        const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`${month}/26/${year}`));
        const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`${month}/26/${year}`));
        //const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`11/26/${year}`));    //oren
        //const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`11/26/${year}`));  //oren
        if (!inTimeShifts)
            return res.status(httpCodes.OK).send(null);
        const inTimeRes = getStats('lector', inTimeShifts);
        if (!inTimeRes)
            return res.status(httpCodes.OK).send(null);
        const notInTimeRes = getStats('lector', notInTimeShifts);
        if (!notInTimeRes)
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
// פונקציה האחראית על הניתוח סטטיסטי לפי מחלקה
// היא מבצעת את הניתוח גם לפי מחלה/חופש/דיווח בזמן/לא דיווח בזמן/ביטול
//היא סופרת כמות פעמים לפי כל ניתוח ומחזירה את המחלקה אם הניתוח הסטטיסטי הכי גבוה /נמוך
async function departmentStats(req, res, next) {
    try {
        const month = req.params.month; // בחירת התאריך
        const year = req.params.year; 
        const finalArrayResultdep = []; //המערך שיציג את הנתונים 

        const shifts = await Shift.find({ // משמרות שאושרו
            submitted: true
        });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts"); // אם אין משמרות מחזיר הודעת שגיאה
        const filteredShifts = getFilteredShifts(shifts, month, year); //מסנן את המשמרות לפי החודש והשנה
//המשמרות שיש במחלקות המופיעות כ״ביטול״
        const canceledShifts = filteredShifts.filter(s => s.absent === 'ביטול');
        if (!canceledShifts)
            return res.status(httpCodes.OK).send(null);
        const canceledRes = getStats('department', canceledShifts); //     getStats שימוש בפונקציה   
        console.log(canceledRes);
        if (!canceledRes)
            return res.status(httpCodes.OK).send(null);
        finalArrayResultdep.push(canceledRes);// הכנסת הנתונים למערך לפי המשמרות המופיעות כ״ביטול״
        console.log('cancel');
        console.log(finalArrayResultdep);
        // בדומה לפונקציה הקודמת רק לפי הניתוח הסטטיסטי של ״מחלה״
        const sickShifts = filteredShifts.filter(s => s.absent === 'מחלה');
        if (!sickShifts)
            return res.status(httpCodes.OK).send(null);
        const sickRes = getStats('department', sickShifts);
        if (!sickRes)
            return res.status(httpCodes.OK).send(null);
        finalArrayResultdep.push(sickRes);
        console.log('sick');
        console.log(finalArrayResultdep);
        //// בדומה לפונקציה הקודמת רק לפי הניתוח הסטטיסטי של ״חופש״
        const offShifts = filteredShifts.filter(s => s.absent === 'חופש');
        if (!offShifts)
            return res.status(httpCodes.OK).send(null);
        const offRes = getStats('department', offShifts);
        if (!offRes)
            return res.status(httpCodes.OK).send(null);
        finalArrayResultdep.push(offRes);
        console.log('dayoff');
        console.log(finalArrayResultdep);

        // בדומה לפונקציה הקודמת רק לפי הניתוח הסטטיסטי של ״דיווחים בזמן״ או ״לא דיווחים בזמן״ לפי הגדרת דיווח בזמן כמו במרצים
        const submittedShifts = filteredShifts.filter(s => s.submitted === true);
        const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`${month}/26/${year}`));
        const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`${month}/26/${year}`));
        //const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`11/26/${year}`));    //oren
        //const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`11/26/${year}`));  //oren
        if (!inTimeShifts)
            return res.status(httpCodes.OK).send(null);
        const inTimeRes = getStats('department', inTimeShifts);
        if (!inTimeRes)
            return res.status(httpCodes.OK).send(null);
        const notInTimeRes = getStats('department', notInTimeShifts);
        if (!notInTimeRes)
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
//פונקציה שמחזירה את כל המשמרות לפי חודש ושנה שניבחרו ע״י המשתמש
function getFilteredShifts(shifts, month, year) {
    // month='11'; //need to remove!!!!
    const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
    if (!filterredShifts)
        return res.status(httpCodes.FORBIDDEN).send("no shifts");
    const dateFillteredShifts = filterredShifts.filter(s => s.date.split('/')[2] === year);
    if (!dateFillteredShifts)
        return res.status(httpCodes.FORBIDDEN).send("no shifts");
    return dateFillteredShifts;
}
//פונקציה שאנו משתמשים בה גם למרצה וגם למחלקה
// פונקציה זו מקבלת מרצה/מחלקה וסוג הדיווח(מחלה,חופש,ביטול,דיווח בזמן,לא דיווח בזמן
//סופרת את הכמות של כל ניתוח ומחשבת את המקסימום ואת המינמום
// לבסוף היא מחזירה את השם של המשתמש בעל הניתוח הגבוהה ביותר ואת הנמוך ביותר
//במידה ויש שני מרצים אם אותה כמות ניתוח סטטיסטי היא מחזירה אחד מהם
function getStats(identify, shifts) {
    let max;  //הכמות הכי גבוהה לפי הניתוח הסטט
    let maxID;
    let min;
    let minID;
    const statList = [];
    let dataToPush = {
        id: String,
        count: Number
    };
    shifts.forEach(element => {
        if (statList.length === 0) {
            if (identify === 'lector')
                dataToPush = {
                    id: element.employeeId,
                    count: 1
                };
            else if (identify === 'department')
                dataToPush = {
                    id: element.department,
                    count: 1
                };
            statList.push(dataToPush);
        } else {
            let flag = false;
            statList.forEach(statElem => {
                if (identify === 'lector') {
                    if (statElem.id === element.employeeId) {
                        flag = true;
                        statElem.count++;
                    }
                } else if (identify === 'department') {
                    if (statElem.id === element.department) {
                        flag = true;
                        statElem.count++;
                    }
                }
            });
            if (flag === false) {
                if (identify === 'lector')
                    dataToPush = {
                        id: element.employeeId,
                        count: 1
                    };
                else if (identify === 'department')
                    dataToPush = {
                        id: element.department,
                        count: 1
                    };
                statList.push(dataToPush);
            }
        }
    });
    console.log(statList[0]);
    min = max = statList[0].count;
    statList.forEach(statElem => {
        if (statElem.count < min && statElem.id !== maxID) {
            min = statElem.count;
            minID = statElem.id;
        }
        if (statElem.count > max) {
            max = statElem.count;
            maxID = statElem.id;
        }
    });
    if (minID === undefined) {
        minID = maxID;
        min = max;
    } else if (maxID === undefined) {
        maxID = minID;
        max = min;
    }
    const res = {
        maxID: maxID,
        maxCount: max,
        minID: minID,
        minCount: min
    };
    return res;
}
// פונקציה שבודקת האם קיים המרצה בבסיס הנתונים
// מקבלת את המזהה של המרצה ובודקת אם הוא קיים ברשימה ומחזירה אמת או שקר בהתאם
function checkIfLectorExistedInList(list, lectorId) {
    let flag = false;
    list.forEach(lec => {
        if (lec === lectorId) {
            flag = true;
        }
    });
    return flag;
}
// מחפשת מרצה מסויים במידה ולא נימצא ברשימה
//לפי המזהה שלו ומחזירה את המרצה
function findLec(lecList, lecId){
    let lector;
    lecList.forEach(lec => {
        if(`${lec._id}` === lecId){
            lector = lec;
        }
    });
    return lector;
}
// פונקציה זו אחראית על דיווחים בזמן או לא דיווחין בזמן בדף של מנהלת השכר
// קיימים בה מערך של מרצים,מערך של דיווחים בזמן,מערך של דיווחים שאינם בזמן
// בודקת אם קיימים משמרות ומסננת אותם לפי חודש ושנה
// דיווח בזמן מוגדר אם המשתמש אישר משמרות עד או לפני ה26 לחודש אחרת לא דיווח בזמן
//הפונקציה בודקת אם כל המרצים קיימים במערך אם אחד המרצים לא קיימים במערך אז הפונקציה מכניסה אותו למערך
//  אז אותו משתמש נכנס למערך של אי דיווחים בזמן lectorsumbited===false -אם המרצה לא אישר את המשמרות שלו  
//אם המרצה אישר את הדיווחים שלו וגם התאריך שהוא אישר קטן או שווה מה26 לחודש-במידה והוא לא קיים ברשימה-הוא נכנס למערך של הדיווחים בזמן
//אחרת אם דיווח אחרי נכנס למערך של הדיווחים שאינם בזמן
async function getLectorsStats(req, res, next) {
    try {
        const lectors = [];
        const inTimeSubmitted = [];
        const delayedSubmitted = [];

        const shifts = await Shift.find(); // 
        if (!shifts) {
            return res.status(httpCodes.FORBIDDEN).send("no shifts");
        }
        const fShifts = getFilteredShifts(shifts, `${new Date().getMonth()+1}`, `${new Date().getFullYear()}`);
        console.log(fShifts);

        const dateToSubmit = new Date(`${new Date().getMonth()+1}/26/${new Date().getFullYear()}`).toLocaleDateString();
        fShifts.forEach(element => {
            if (!checkIfLectorExistedInList(lectors, element.employeeId)) {
                console.log('pushed to lectors');
                lectors.push(element.employeeId);
            }
            if (element.lectorSubmitted === undefined || element.lectorSubmitted === false) {
                if (!checkIfLectorExistedInList(delayedSubmitted, element.employeeId)) {
                    console.log('pushed to delayed , submitted false');
                    delayedSubmitted.push(element.employeeId);
                }
            } else if (element.lectorSubmitted === true) {
                if (element.dateLectorSubmit <= dateToSubmit) {
                    if (!checkIfLectorExistedInList(inTimeSubmitted, element.employeeId)) {
                        console.log('pushed to in time');
                        inTimeSubmitted.push(element.employeeId);
                    }
                } else {
                    if (!checkIfLectorExistedInList(delayedSubmitted, element.employeeId)) {
                        console.log('pushed to delayed, over time');
                        delayedSubmitted.push(element.employeeId);
                    }
                }
            }
        });
        //מחזיר את פרטי המרצה
        const lectorsList = await userController.getLectors(req, res, next);
        if (!lectorsList) {
            return res.status(httpCodes.CONFLICT).send("no lectors");
        }
//מערך הדיווחים בזמן
        const updatedInTime = [];
        inTimeSubmitted.forEach(element => {
            let fullLec = findLec(lectorsList, element);
            if(fullLec !== undefined){
                updatedInTime.push(fullLec);
            }
        });
//מערך הדיווחים שאינם בזמן
        const updatedDelayed = [];
        delayedSubmitted.forEach(element => {
            let fullLec = findLec(lectorsList, element);
            if(fullLec !== undefined){
                updatedDelayed.push(fullLec);
            }
        });
        // האובייקט הסופי
        const dataToSend = {
            inTime: updatedInTime,
            delayed: updatedDelayed
        }
        return res.status(httpCodes.OK).send(dataToSend);
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
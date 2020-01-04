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
       
        let cFinalResult;
        if(canceledShifts.length < 1) {
          cFinalResult = null;  //בדיקה בקליינט קודם כל אם שונה מ NULL אחרת מציג אין נתונים.
        } else { 
        console.log(canceledShifts);
          const canceledRes = getArrayOfStats(canceledShifts);
          console.log(canceledRes)  ;
          const canceledStats = getMinMaxStats(canceledRes);
          console.log('cancel');
          console.log(canceledStats);
          const cmaxUser = await userController.getUserById(canceledStats.maxID);// מחזיר את כל פרטי המשתמש שהוא המקסימום
          const cminUser = await userController.getUserById(canceledStats.minID);         // מחזיר את כל פרטי המשתמש שהוא מינימום

          cFinalResult = {   
            
          // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
              maxUser: cmaxUser, // שם המשתמש הכי גבוהה
              maxCount: canceledStats.maxCount,// הצגת הנתון הכי גבוהה
              minUser: cminUser,//שם המשתמש הכי נמוך
              minCount: canceledStats.minCount //הצגת הנתון הכי נמוך
            };
        }
        finalArrayResult.push(cFinalResult);// הצגת המערך
      
        

        // מדובר בפונקציה הדומה לדוגמא הראשונה רק שמתייחסת לניתוח סטטיסטי הקשור ל״מחלה״
        const sickShifts = filteredShifts.filter(s => s.absent === 'מחלה');
        if (!sickShifts) // אם אין משמרות המופיעות כ״ביטול״ מחזיר תוכן הודעה ריק
            return res.status(httpCodes.OK).send(null);
        let sFinalResult;
        if(sickShifts.length < 1){
        sFinalResult = null;  //בדיקה בקליינט קודם כל אם שונה מ NULL אחרת מציג אין נתונים.
        } else { 
        const sickRes = getArrayOfStats(sickShifts);  
        const sickStats = getMinMaxStats(sickRes);
        console.log('sick');
        console.log(sickStats);
        const smaxUser = await userController.getUserById(sickStats.maxID);// מחזיר את כל פרטי המשתמש שהוא המקסימום
        const sminUser = await userController.getUserById(sickStats.minID);// מחזיר את כל פרטי המשתמש שהוא מינימום
        sFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
            maxUser: smaxUser, // שם המשתמש הכי גבוהה
            maxCount: sickStats.maxCount,// הצגת הנתון הכי גבוהה
            minUser: sminUser,//שם המשתמש הכי נמוך
            minCount: sickStats.minCount //הצגת הנתון הכי נמוך
            };
        }
        finalArrayResult.push(sFinalResult);// הצגת המערך
        // מדובר בפונקציה הדומה לפונקציה הראשונה רק שמתייחסת לניתוח הסטטיסטי לפי ״חופש״
        const offShifts = filteredShifts.filter(s => s.absent === 'חופש');
        if (!offShifts) // אם אין משמרות המופיעות כ״ביטול״ מחזיר תוכן הודעה ריק
            return res.status(httpCodes.OK).send(null);
        let oFinalResult;
        if(offShifts.length < 1){
        oFinalResult = null;  //בדיקה בקליינט קודם כל אם שונה מ NULL אחרת מציג אין נתונים.
        } else { 
        const offRes = getArrayOfStats(offShifts);
        const offStats = getMinMaxStats(offRes);  
        const omaxUser = await userController.getUserById(offStats.maxID);// מחזיר את כל פרטי המשתמש שהוא המקסימום
        const ominUser = await userController.getUserById(offStats.minID);// מחזיר את כל פרטי המשתמש שהוא מינימום
        oFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
            maxUser: omaxUser, // שם המשתמש הכי גבוהה
            maxCount: offStats.maxCount,// הצגת הנתון הכי גבוהה
            minUser: ominUser,//שם המשתמש הכי נמוך
            minCount: offStats.minCount //הצגת הנתון הכי נמוך
            };
        }
        finalArrayResult.push(oFinalResult);// הצגת

        // פונקציה הדומה לפונקציה הראשונה רק שמתייחסת לניתוח הסטטיסטי לפי ״דיווח בזמן או ״דיווח לא בזמן״
        // הגדרה של דיווח בזמן הינה לפי התאריך שבה המשתמש אישר את המשמרות שלו-אם אישר עד ה26 לחודש או לפני דיווח בזמן אם אחרי לא דיווח בזמן
        // מחזיר את פרטי המשתמש שדיווח בזמן /לא דיווח בזמן
        const submittedShifts = filteredShifts.filter(s => s.submitted === true);
        const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`${month}/26/${year}`));
        const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`${month}/26/${year}`));
        //const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`11/26/${year}`));    //oren
        //const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`11/26/${year}`));  //oren
        let inTimeRes;
        let notInTimeRes;
        let nitmaxUser;
        let itmaxUser;
        let inTimeStats;
        let notInTimeStats;
        if(inTimeShifts.length < 1 || notInTimeShifts.length < 1){
            if(inTimeShifts.length < 1){
                inTimeRes = {
                id: 'none',
                count: 0
                };
                notInTimeRes = getArrayOfStats(notInTimeShifts);  
                notInTimeStats = getMinMaxStats(notInTimeRes);
                nitmaxUser = await userController.getUserById(notInTimeStats.maxID);// מחזיר את כל פרטי המשתמש שהוא המקסימום
                itFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
                maxUser: nitmaxUser, // שם המשתמש הכי גבוהה
                maxCount: notInTimeStats.maxCount,// הצגת הנתון הכי גבוהה
                minUser: inTimeRes.id,//שם המשתמש הכי נמוך
                minCount: inTimeRes.count //הצגת הנתון הכי נמוך
                };
            }
            if(notInTimeShifts.length < 1){
                notInTimeRes = {
                id: 'none',
                count: 0
                };
                inTimeRes = getArrayOfStats(inTimeShifts);
                inTimeStats = getMinMaxStats(inTimeRes);
                itmaxUser = await userController.getUserById(inTimeStats.maxID);// מחזיר את כל פרטי המשתמש שהוא מינימום
                itFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
                maxUser: notInTimeRes.id, // שם המשתמש הכי גבוהה
                maxCount: notInTimeRes.count,// הצגת הנתון הכי גבוהה
                minUser: itmaxUser,//שם המשתמש הכי נמוך
                minCount: inTimeStats.maxCount //הצגת הנתון הכי נמוך
                };
            }
        }
        else {
        inTimeRes = getArrayOfStats(inTimeShifts);
        inTimeStats = getMinMaxStats(inTimeRes);  
        notInTimeRes = getArrayOfStats(notInTimeShifts); 
        notInTimeStats = getMinMaxStats(notInTimeRes);
        nitmaxUser = await userController.getUserById(notInTimeStats.maxID);// מחזיר את כל פרטי המשתמש שהוא המקסימום
        itmaxUser = await userController.getUserById(inTimeStats.maxID);// מחזיר את כל פרטי המשתמש שהוא מינימום
        itFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
            maxUser: nitmaxUser, // שם המשתמש הכי גבוהה
            maxCount: notInTimeStats.maxCount,// הצגת הנתון הכי גבוהה
            minUser: itmaxUser,//שם המשתמש הכי נמוך
            minCount: inTimeStats.maxCount //הצגת הנתון הכי נמוך
            };
        }
        finalArrayResult.push(itFinalResult);// הצגת 
        
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
            let cFinalResult;
            if(canceledShifts.length < 1) {
            cFinalResult = null;  //בדיקה בקליינט קודם כל אם שונה מ NULL אחרת מציג אין נתונים.
            } else { 
            const canceledRes = getArrayOfStatsOfDepartment(canceledShifts);  
            const canceledStats = getMinMaxStats(canceledRes);
            cFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
                maxID: canceledStats.maxID, // שם המשתמש הכי גבוהה
                maxCount: canceledStats.maxCount,// הצגת הנתון הכי גבוהה
                minID: canceledStats.minID,//שם המשתמש הכי נמוך
                minCount: canceledStats.minCount //הצגת הנתון הכי נמוך
                };
            }
            finalArrayResultdep.push(cFinalResult);// הצגת המערך
    
    


        // בדומה לפונקציה הקודמת רק לפי הניתוח הסטטיסטי של ״מחלה״
        const sickShifts = filteredShifts.filter(s => s.absent === 'מחלה');
        if (!sickShifts)
            return res.status(httpCodes.OK).send(null);

            let sFinalResult;
            if(sickShifts.length < 1) {
            sFinalResult = null;  //בדיקה בקליינט קודם כל אם שונה מ NULL אחרת מציג אין נתונים.
            } else { 
            const sickRes = getArrayOfStatsOfDepartment(sickShifts);  
            const sickStats = getMinMaxStats(sickRes);
            sFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
                maxID: sickStats.maxID, // שם המשתמש הכי גבוהה
                maxCount: sickStats.maxCount,// הצגת הנתון הכי גבוהה
                minID: sickStats.minID,//שם המשתמש הכי נמוך
                minCount: sickStats.minCount //הצגת הנתון הכי נמוך
                };
            }
            finalArrayResultdep.push(sFinalResult);// הצגת המערך

        //// בדומה לפונקציה הקודמת רק לפי הניתוח הסטטיסטי של ״חופש״
        const offShifts = filteredShifts.filter(s => s.absent === 'חופש');
        if (!offShifts)
            return res.status(httpCodes.OK).send(null);
        let oFinalResult;
        if(offShifts.length < 1) {
        oFinalResult = null;  //בדיקה בקליינט קודם כל אם שונה מ NULL אחרת מציג אין נתונים.
        } else { 
        const offRes = getArrayOfStatsOfDepartment(offShifts);  
        const offStats = getMinMaxStats(offRes);
        oFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
            maxID: offStats.maxID, // שם המשתמש הכי גבוהה
            maxCount: offStats.maxCount,// הצגת הנתון הכי גבוהה
            minID: offStats.minID,//שם המשתמש הכי נמוך
            minCount: offStats.minCount //הצגת הנתון הכי נמוך
            };
        }
        finalArrayResultdep.push(oFinalResult);// הצגת המערך

        // בדומה לפונקציה הקודמת רק לפי הניתוח הסטטיסטי של ״דיווחים בזמן״ או ״לא דיווחים בזמן״ לפי הגדרת דיווח בזמן כמו במרצים
        const submittedShifts = filteredShifts.filter(s => s.submitted === true);
        const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`${month}/26/${year}`));
        const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`${month}/26/${year}`));
       // const inTimeShifts = submittedShifts.filter(s => Date.parse(s.date) <= Date.parse(`11/26/${year}`));    //oren
       // const notInTimeShifts = submittedShifts.filter(s => Date.parse(s.date) > Date.parse(`11/26/${year}`));  //oren
        if (!inTimeShifts)
            return res.status(httpCodes.OK).send(null);


            let inTimeRes;
            let notInTimeRes;
            let nitmaxUser;
            let itmaxUser;
            let inTimeStats;
            let notInTimeStats;
            if(inTimeShifts.length < 1 || notInTimeShifts.length < 1){
                if(inTimeShifts.length < 1){
                    inTimeRes = {
                    id: 'none',
                    count: 0
                    };
                    notInTimeRes = getArrayOfStatsOfDepartment(notInTimeShifts);  
                    notInTimeStats = getMinMaxStats(notInTimeRes);
                    
                    itFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
                    maxID: notInTimeStats.maxID, // שם המשתמש הכי גבוהה
                    maxCount: notInTimeStats.maxCount,// הצגת הנתון הכי גבוהה
                    minID: inTimeRes.id,//שם המשתמש הכי נמוך
                    minCount: inTimeRes.count //הצגת הנתון הכי נמוך
                    };
                }
                if(notInTimeShifts.length < 1){
                    notInTimeRes = {
                    id: 'none',
                    count: 0
                    };
                    inTimeRes = getArrayOfStatsOfDepartment(inTimeShifts);
                    inTimeStats = getMinMaxStats(inTimeRes);
            
                    itFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
                    maxID: notInTimeRes.id, // שם המשתמש הכי גבוהה
                    maxCount: notInTimeRes.count,// הצגת הנתון הכי גבוהה
                    minID: inTimeStats.maxID,//שם המשתמש הכי נמוך
                    minCount: inTimeStats.maxCount //הצגת הנתון הכי נמוך
                    };
                }
            }
            else {
            inTimeRes = getArrayOfStatsOfDepartment(inTimeShifts);
            inTimeStats = getMinMaxStats(inTimeRes);  
            notInTimeRes = getArrayOfStatsOfDepartment(notInTimeShifts); 
            notInTimeStats = getMinMaxStats(notInTimeRes);
            
            itFinalResult = {   // מערך המחזיר את פרטי המשתמש ואת הכמות הגדולה/קטנה לפי הניתוח הסטטיסטי
                maxID: notInTimeStats.maxID, // שם המשתמש הכי גבוהה
                maxCount: notInTimeStats.maxCount,// הצגת הנתון הכי גבוהה
                minUser: inTimeStats.maxID,//שם המשתמש הכי נמוך
                minCount: inTimeStats.maxCount //הצגת הנתון הכי נמוך
                };
            }
            finalArrayResultdep.push(itFinalResult);// הצגת 
        return res.status(httpCodes.OK).send(finalArrayResultdep);
    } catch (error) {
        next(error);
    }
}
//פונקציה שמחזירה את כל המשמרות לפי חודש ושנה שניבחרו ע״י המשתמש
//function getFilteredShifts(shifts, month, year) {
    // month='11'; //need to remove!!!!
  //  const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); /// ״מסנן משמרות לפי חודש :הפונקציה לוקחת את התאריך שהתקבל ומפרקת אותה למערך לפי התו ומחזירה את הערך שבמקום הראשון    Shlomi: [0]
    //if (!filterredShifts)
      //  return res.status(httpCodes.FORBIDDEN).send("no shifts");
    //const dateFillteredShifts = filterredShifts.filter(s => s.date.split('/')[2] === year);
    //if (!dateFillteredShifts)
      //  return res.status(httpCodes.FORBIDDEN).send("no shifts");
    //return dateFillteredShifts;
    
//}

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

function compareStats(a,b) {
  if(a.count > b.count){
    return -1;
  }
  else if(a.count < b.count){
    return 1;
  }
  return 0;
}

function getMinMaxStats(stats){
  const statsResult = {
    maxID: String,
    max: Number,
    minID: String,
    min: Number
  };
  stats = stats.sort(compareStats);
  statsResult.maxID = stats[0].id;
  statsResult.maxCount = stats[0].count;
  statsResult.minID = stats[stats.length-1].id;
  statsResult.minCount = stats[stats.length-1].count;
  return statsResult;
}

function getArrayOfStats(shifts){
    let dataToPush = {
        id: String,
        count: Number
    };
    const statsList = [];
    let index;
    let flag = false;
    shifts.sort(compareShifts);
  shifts.forEach(element => {
      flag = false;
        if(statsList.length < 1){
            statsList.push({id: element.employeeId, count: 1});
        }  
        else{
            statsList.forEach(elem => {
                if(`${element.id}` === `${elem.employeeId}`){
                    statsList[index].count += 1;
                    flag = true;
                }
                index += 1;
            });
            if(flag === false){
                statsList.push({id: element.employeeId, count: 1});
            }
        }
    });
    const stats = [];
    let stat = statsList[0];
    flag = false;
    stat.count = 0;
    statsList.forEach(element => {
        if(element.id !== stat.id){
            stats.push(stat);
            stat = element;
        }
        else if(element.id === stat.id){
            stat.count += 1;
        }
    });
    stats.forEach(element => {
        if(element.id === stat.id){
            flag = true;
        }
    });
    if(!flag){
        stats.push(stat);
    }
    stats.sort(compareStats);
    if(stats.length < 1) {
        return statsList;
    }
    return stats;
}

function getArrayOfStatsOfDepartment(shifts){
    let dataToPush = {
        id: String,
        count: Number
    };
    const statsList = [];
    let index;
    let flag = false;
    shifts.sort(compareShiftsofDepartment);
  shifts.forEach(element => {
      flag = false;
        if(statsList.length < 1){
            statsList.push({id: element.department, count: 1});
        }  
        else{
            statsList.forEach(elem => {
                if(`${element.id}` === `${elem.department}`){
                    statsList[index].count += 1;
                    flag = true;
                }
                index += 1;
            });
            if(flag === false){
                statsList.push({id: element.department, count: 1});
            }
        }
    });
    const stats = [];
    let stat = statsList[0];
    stat.count = 0;
    flag = false;
    statsList.forEach(element => {
        if(element.id !== stat.id){
            stats.push(stat);
            stat = element;
        }
        else if(element.id === stat.id){
            stat.count += 1;
        }
    });
    stats.forEach(element => {
        if(element.id === stat.id){
            flag = true;
        }
    });
    if(!flag){
        stats.push(stat);
    }
    stats.sort(compareStats);
    if(stats.length < 1) {
        return statsList;
    }
    return stats;
}

function compareShifts(a, b){
  if(a.employeeId > b.employeeId) {
    return 1;
  } else if(a.employeeId < b.employeeId) {
    return -1;
  }
  return 0;
}

function compareShiftsofDepartment(a, b){
    if(a.department > b.department) {
      return 1;
    } else if(a.department < b.department) {
      return -1;
    }
    return 0;
  }

function findIndexOfStats(statsList, elem) {
    let index;
    if(statsList.length < 1) return -1;
  statsList.forEach((element) => {
    if(element.id === elem.employeeId){
        console.log('index', index);
      return index;
    }
    index += 1;
  });
  return -1;
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
        updatedInTime.forEach(element => {
            updatedDelayed.forEach(elem => {
                if(element._id === elem._id){
                    updatedInTime.splice(element, 1);
                }
            });
            
        });
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
const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');

async function postShift(req, res, next) {
    try {
        const shift = req.body.shift;
        const id = shift.employeeId;
        const user = await User.findOne({
            _id: id
        });
        if (!user) return res.status(httpCodes.CONFLICT).send("there is no such user");
        const department = user.department;
        shift.department = department;
       // console.log(shift);
        existedShift = await Shift.find({ employeeId: shift.employeeId, date: shift.date });
        console.log('existedShift');
        console.log(existedShift);
        console.log('after');
        if(existedShift){
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
                            checkHourValidation(res, element, shift);
                        }
                       }
    
                });
            }
           
        }
        const shiftFromDb = await Shift.create(shift);
        if (!shiftFromDb) return res.status(httpCodes.FORBIDDEN).send("cannot create this shift");
        //console.log(shiftFromDb);
        return res.status(httpCodes.OK).send(shiftFromDb);
    } catch (error) {
        next(error);
    }
}

async function getShifts(req, res, next) {
    try {
        const employeeId = req.params.id;
        const shifts = await Shift.find({
            employeeId: employeeId
        });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts to that employee");
        console.log(shifts);
        return res.status(httpCodes.OK).send(shifts);
    } catch (error) {
        next(error);
    }
}

async function deleteShift(req, res, next) {
    try {
        const shiftId = req.params.id;
        const shift = await Shift.findOne({
            _id: shiftId
        });
        if (!shift) return res.status(httpCodes.FORBIDDEN).send("There is no such shift");
        console.log(shift);
        await Shift.deleteOne({
            _id: shift._id
        });
        return res.status(httpCodes.NO_CONTENT).send("success");
    } catch (error) {
        next(error);
    }
}

function checkHourValidation(res, element, shift) {
    const startFromDb = element.start;
    const endFromDb = element.end; 
    console.log('checkHourValidation');
    console.log(element);
    console.log(shift);
    console.log('-------');  
    if(!checkHours(startFromDb, shift.start)) {
        return res.status(httpCodes.CONFLICT).send("start hour confilct");
    }
    else if(!checkHours(endFromDb, shift.end)){
        return res.status(httpCodes.CONFLICT).send("end hour confilct");
    }
    else if(!checkHours(endFromDb, shift.start)){
        return res.status(httpCodes.CONFLICT).send("end-start hour confilct");
    }
}

function checkHours(existed, toAdd) {
    const splitedExisted = existed.split(':');
    const splitedToAdd = toAdd.split(':');
    if(+splitedExisted[0] > +splitedToAdd[0]){
        console.log('hour with hour');
      return false;
    }
    else if(+splitedExisted[1] > +splitedToAdd[1]){
        console.log('min with min');
        return false;
      }
    else if(+splitedExisted[0] === +splitedToAdd[0] && +splitedExisted[1] === +splitedToAdd[1]){
        console.log('details');
        console.log('existed');
        console.log(+splitedExisted[0]);
        console.log(+splitedExisted[1]);
        console.log('shift');
        console.log(+splitedToAdd[0]);
        console.log(+splitedToAdd[1]);
        console.log('same same'); 
        return false;
    }
    return true;
  }

const shiftsControllers = {
    postShift,
    getShifts,
    deleteShift
};
module.exports = shiftsControllers;
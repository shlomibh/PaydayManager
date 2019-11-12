const httpCodes = require('http-status-codes');
const User = require('../models/Users');
const Shift = require('../models/Shifts');

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

async function getShifts(req, res, next) {
    try {
        const employeeId = req.params.id;
        const shifts = await Shift.find({
            employeeId: employeeId
        });
        if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts to that employee");
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

const shiftsControllers = {
    postShift,
    getShifts,
    deleteShift
};
module.exports = shiftsControllers;
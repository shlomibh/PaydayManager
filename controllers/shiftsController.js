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
        shift.submitted = false;
        console.log(shift);
        const shiftFromDb = await Shift.create(shift);
        if (!shiftFromDb) return res.status(httpCodes.FORBIDDEN).send("cannot create this shift");
        console.log(shiftFromDb);
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

    async function getShiftsPerMonth(req, res, next) {
        try {
            const employeeId = req.params.id;
            const month = req.params.month;
            const year = req.params.year;
            const shifts = await Shift.find({
                employeeId: employeeId
            });
            if (!shifts) return res.status(httpCodes.FORBIDDEN).send("there is no shifts to that employee");
            const filterredShifts = shifts.filter(s => s.date.split('/')[0] === month); //Shlomi: [0]
            console.log(filterredShifts);
            return res.status(httpCodes.OK).send(filterredShifts);
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

const shiftsControllers = {
    postShift,
    getShifts,
    getShiftsPerMonth,
    deleteShift
};
module.exports = shiftsControllers
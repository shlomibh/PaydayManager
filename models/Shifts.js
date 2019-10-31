const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const ShiftSchema = new Schema({
    employeeId: {
        required: true,
        type: String
    },
    department: {
        required: true,
        type: String
    },
    date: {
        required: true,
        type: String
    },
    start: {
        type: String
    },
    end: {
        type: String
    },
    absent: {
        type: String
    },
});

ShiftSchema.plugin(uniqueValidator, {
    message: "is already taken."
});

const Shift = mongoose.model("Shift", ShiftSchema);

module.exports = Shift;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
// יצירת מחלקה של דיווח
const ShiftSchema = new Schema({
    employeeId: {  //תעודת זהות של העובד
        required: true,  //שדה חובה למלא
        type: String // מסוג מחרוזת
    },
    department: {  //מחלקה
        required: true,
        type: String
    },
    date: {  //תאריך עבודה
        required: true,
        type: String
    },
    start: {  //שעת התחלה
        type: String
    },
    end: {  // שעת סוף
        type: String
    },
    absent: {  //היעדרות
        type: String
    },
    submitted: {  // אישור משמרות ראש מחלקה של המרצה תחתיו
        type: Boolean
    },
    lectorSubmitted: {  // אם המרצה אישר את המשמרות שלו
        type: Boolean
    },
    dateLectorSubmit: { // תאריך אישור המשמרות של אותו חודש של המרצה
        type: String
    }
});

ShiftSchema.plugin(uniqueValidator, {
    message: "is already taken."
});

const Shift = mongoose.model("Shift", ShiftSchema); //מחלקה ״דיווח״ נרשמת בבסיס הנתונים

module.exports = Shift;
const mongoose= require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
FirstName:{
    type:String,
    required:true
},
LastName:{
    type:String,
    requierd:true
},
PhoneNumber:{
    type:Integer,
    requierd:true
},
Department:{
    type:String,
    requierd:true
},
Email:{
    type:String,
    requierd:true
},
StreetAdress:{
    type:String,
    requierd:true
},
DayStartWork:{
    type:Integer,
    requierd:true
},
Seniority:{
    type:Integer,
    requierd:true
}
});

const User = mongoose.module('User',userSchema);

module.exports = User;













)
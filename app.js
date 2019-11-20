//http package
const express = require("express");
//const bodyParser= require('body-parser');
const mongoose = require("mongoose");
const keys = require("./config/keys");
require("./models/Users");
require("./config/passport");
cors = require('cors');
// const Users = require('./models/Users');

// התחברות למונגו 
mongoose
  .connect(keys.mongoURI, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB is connected"); // אם ההתחברות תקינה מוציא הודעה בהתאם
  })
  .catch(err => {
    console.log("erro occured in connection to mongo"); //אחרת מוציא הודעה שגיאה בהתאם
    console.log(err);
  });
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(require("./routes"));

const PORT = process.env.PORT || 5000; //הפורט איתו התבצעו הפניות לשרת


var originsWhitelist = [
  'http://localhost:4200',      //שם השרת
];
var corsOptions = {
  origin: function(origin, callback){
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true
}

app.use(cors(corsOptions));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(PORT, () => {
  console.log(`Server listennig on http://localhost:${PORT}`);

  // const user = new Users({username:'shlomi',firstName:'shlomib',lastName:'ben hamo',phoneNumber:'0525011672',department:'software',role:'admin',email:'shlomi@walla.com',id:'305504565'});
  // user.setPassword('1234');
  // user.save();
});

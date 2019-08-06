//http package
const express = require("express");
//const bodyParser= require('body-parser');
const mongoose = require("mongoose");
const keys = require("./config/keys");
require("./models/Users");
require("./config/passport");
const Users = require('./models/Users');

mongoose
  .connect(keys.mongoURI, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch(err => {
    console.log("erro occured in connection to mongo");
    console.log(err);
  });
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(require("./routes"));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server listennig on http://localhost:${PORT}`);

  const user = new Users({username:'shlomi',firstName:'shlomib',lastName:'ben hamo',phoneNumber:'0525011672',department:'software',role:'admin',email:'shlomi@walla.com',id:'305504565'});
  user.setPassword('1234');
  user.save();
});

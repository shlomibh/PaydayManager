const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = require("../config").secret;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      required: [true, "cant't be blank"],
      match: [/^[a-zA-Z0-9]$/, "is invalid"],
      index: true,
      unique: true
    },

    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    phoneNumber: {
      maxlength: 10,
      minlength: 10,
      type: String,
      required: true,
      match: [/^[0-9]$/, "Only Number allowed"]
    },
    department: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
      unique: true
    },
    image: {
      type: String
    },
    id: {
      type: String,
      required: true,
      match: [/^[0-9]{9}$/, "Only Number allowed"]
    },
    hash: {
      type: String
    },
    salt: {
      type: String
    }
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};
UserSchema.methods.validPassword = function(password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.method.getrateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000)
    },
    secret
  );
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    firstName: this.firstName,
    lastName: this,
    lastName,
    department: this.department,
    token: this.generateJWT(),
    image: this.image
  };
};

const User = mongoose.model("User", UserSchema);

module.exports = User;

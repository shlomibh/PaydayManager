const httpCodes = require('http-status-codes');
const User = require('../models/Users');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.validPassword(password)) {
      return res.status(httpCodes.UNAUTHORIZED).send("email or password not valid");
    } else {
      const token = await user.generateJWT();

      return res.status(httpCodes.OK).send(token);
    }
  } catch (error) {
    next(error);
  }
}

const usersControllers = {
    login
};
module.exports = usersControllers;
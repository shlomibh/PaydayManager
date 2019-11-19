const httpCodes = require('http-status-codes');
const User = require('../models/Users');

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        console.log(email, password);

        const user = await User.findOne({ email });
        if (!user || !user.validPassword(password)) {
            return res.status(httpCodes.UNAUTHORIZED).send("email or password not valid");
        } else {
            const token = await user.generateJWT();
            const credentialToRet = {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    token
                }
                // console.log(req);
            return res.status(httpCodes.OK).send(credentialToRet);
        }
    } catch (error) {
        next(error);
    }
}

async function getUsersDepartment(req, res, next) {
    try {
        const id = req.params.id;
        console.log(id);

        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(httpCodes.UNAUTHORIZED).send("no such user");
        }
        const usersDepartment = await User.find({ department: user.department });
        if(!usersDepartment)
            return res.status(httpCodes.CONFLICT).send("can't be empty department");
        return res.status(httpCodes.OK).send(usersDepartment);
    } catch (error) {
        next(error);
    }
}

const usersControllers = {
    login,
    getUsersDepartment
};
module.exports = usersControllers;
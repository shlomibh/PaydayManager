const router = require("express").Router();
router.use("/users", require("./users"));
router.use("/shifts", require("./shifts"));
module.exports = router;
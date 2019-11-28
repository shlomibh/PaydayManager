const router = require("express").Router();
router.use("/users", require("./users"));
router.use("/shifts", require("./shifts"));
router.use("/statistics", require("./statistics"));

module.exports = router;
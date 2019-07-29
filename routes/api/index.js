const router = require("express").Router();
router.get('/', (req, res) => {
    console.log(req.headers);
    res.send('Hello Shlomi');
} );

module.exports = router;
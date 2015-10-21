/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    console.log("admin verify...")
    next();
});

module.exports = router;
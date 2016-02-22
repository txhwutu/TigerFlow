///<reference path="../typings/tsd.d.ts"/>
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    res.render('index');
});
router.get('/Machine_State', function (req, res, next) {
    res.render('machine');
});
module.exports = router;
//# sourceMappingURL=UI.js.map
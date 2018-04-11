const index = require('../app');
var app = index.myApp;
var model = require('../models/entitymodels');
var utility = require('../Helpers/utility');
var passport = index.myPassport;
var currentDate = new Date();
var crypto = require('crypto');
var fileService = require('../services/fileService');

module.exports.verifyCode = function (req, res) {
    var returnUrl = req.session.returnUrl;
    var code = req.body.FileCode;
    fileService.GetFileByFileCode(code, function (data) {
        fileService.ValidateUser(req, res, data, code, returnUrl);
    });
}

module.exports.genFileNumber = async function (req, res) {
    var code = 'MATTA/' + await utility.randomNumber.generateNum(4) + '-' + await utility.randomNumber.generateNum(4);
    req.session.fileNumber = code;
    req.session.firstname = req.body.firstname;
    req.session.lastname = req.body.lastname;
    req.session.email = req.body.email;
    req.session.phone = req.body.phone;
    req.session.role = req.body.role;
    res.json(1);
}

//STATUS CODE 401 - USER ALREADY EXISTS
module.exports.openFile = async function (req, res, next) {
    utility.createuser(req.session.fileNumber, req.session.email, req.body.password, 'user', async cb => {
        var key = crypto.randomBytes(16).toString("hex");
        if (cb === 0) {
            res.json(401);
            next();
        }
        await model.FileModel.create({
            filecode: req.session.fileNumber,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            email: req.session.email,
            phone: req.session.phone,
            date: currentDate,
            userId: cb._id
        }, async (err, data) => {
            if (data) {
                await passport.authenticate('local-sign-in', {});
                req.session.code = req.session.fileNumber;
                req.session.role = 'user';
            }
            req.login(cb, loginErr => {
                if (loginErr) { }
                else res.json(1);
            });
        });
    });
}

module.exports.getNewRegData = function (req, res) {
    var fileCode = req.session.fileNumber;
    res.json(fileCode);
}

module.exports.filedetails = async (req, res) => {
    await model.FileModel.findOne({ userId: req.user.id }, (err, data) => {
        res.json(data);
    });
}
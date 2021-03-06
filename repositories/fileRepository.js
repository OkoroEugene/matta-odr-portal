const index = require('../app');
var app = index.myApp;
var model = require('../models/entitymodels');
var utility = require('../Helpers/utility');
var currentDate = new Date();
var rootPath = index.myPath;
var mail = require('../Helpers/mail');
var crypto = require('crypto');
var path = require('path');

module.exports = {
    GetFileByFileCode: async function (code, callback) {
        await model.FileModel.findOne({ FileCode: code }, function (err, file) {
            if (file)
                callback(file);
            else
                callback(0);
        });
    },

    GetInviteeByToken: async function (code, callback) {
        await model.InviteeModel.findOne({ SecretToken: code }, function (err, data) {
            if (data)
                callback(data);
            else
                callback(0);
        });
    },

    GetAllCases: async function (req, res, callback) {
        await model.CaseModel.find()
            .populate('ComplaintId')
            .exec(function (err, data) {
                callback(data);
            });
    }
};
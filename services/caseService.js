const index = require('../app');
var app = index.myApp;
var model = require('../models/entitymodels');
var utility = require('../Helpers/utility');
var currentDate = new Date();
var rootPath = index.myPath;
var mail = require('../Helpers/mail');
var crypto = require('crypto');
var path = require('path');
var fileRepo = require('../repositories/fileRepository');
var complaintRepo = require('../repositories/complaintRepository');
var caseRepo = require('../repositories/caseRepository');
var routes = require('../routes');

var caseD = module.exports = {
    ValidateCaseView: function (req, res, ID) {
        model.ConversationModel.findOne({ $and: [{ CaseId: ID }, { ParticipantId: req.user.id }] }).exec((err, data) => {
            if (data) res.sendFile(rootPath + '/views/layout.html');
            else res.redirect('/error');
        });
    },

    AddCaseChat: function (req, res, content, files, callback) {
        var _chat = new model.ChatModel({ CaseId: req.params.id, Content: content, File: files, Date: currentDate });
        var role = utility.UserRole.GetRoleName(req, res);
        utility.getCurrentLoggedInUser.name(req, res, cb => {
            _chat.SenderName = cb;
            _chat.SenderId = req.user._id;
            _chat.save(function (err, data) {
                if (data) {
                    var userId;
                    if (req.user != undefined)
                        userId = req.user._id;
                    caseD.AddNotification(userId, data, function (result) {
                        if (result)
                            callback(data);
                    });
                }
            });
        });
    },

    AddNotification: function (userId, data, callback) {
        model.ConversationModel.find({ CaseId: data.CaseId, ParticipantId: { $ne: userId } }).exec(async function (err, result) {
            if (result)
                for (let i = 0; i < result.length; i++) {
                    var notify = new model.NotificationModel({
                        SenderId: userId,
                        ReceiverId: result[i].ParticipantId,
                        ChatId: data._id,
                        IsRead: false,
                        Date: currentDate
                    });
                    await notify.save(function (err, data) {
                        let finalLength = result.length - 1;
                        if (notify && i === finalLength)
                            callback(notify);
                    })
                }
        })
    },

    GetAllChatsByCaseId: async function (ID, callback) {
        await model.ChatModel.find()
            .where('CaseId')
            .in(ID)
            // .sort({ _id: -1 })
            .populate('CaseId')
            .exec(function (err, data) {
                callback(data);
            })
    },

    AddCaseAndUpdate: function (mediatorId, mediatorName, ID, userId, callback) {
        caseRepo.AddCase(mediatorId, mediatorName, ID, userId, function (data) {
            model.ComplaintModel.findByIdAndUpdate(ID, { Status: 2 }, function (err, result) {
                if (result)
                    callback(data);
            })
        });
    },

    SendMailToInvitee: function (data, caseId, callback) {
        caseRepo.SendMailToInvitee(data, caseId, function (data) {
            callback(data);
        });
    },

    uploadcasefiles: async function (req, res, callback) {
        var key = crypto.randomBytes(16).toString("hex");
        var ImageFile = [];
        if (req.files) {
            var files = req.files;
            // utility.uploadFile.apiUpload(req.files, key);

            await files.forEach(item => {
                ImageFile.push({
                    'filename': item.filename
                });
            });
        }
        callback(ImageFile);
    },

    getInviteeByToken: async function (Id, callback) {
        caseRepo.getInviteeByToken(Id, function (data) {
            callback(data);
        });
    }
}

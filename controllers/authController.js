const index = require('../app');
var app = index.myApp;
var model = require('../models/entitymodels');
var utility = require('../Helpers/utility');
var passport = index.myPassport;
var currentDate = new Date();

module.exports.authenticateUser = function (req, res, next) {
    passport.authenticate('local-sign-in', function (err, user, info) {
        var returnUrl = req.session.returnUrl;
        if (err) {
            // return next(err); // will generate a 500 error
        }
        if (!user) {
            return res.json({ success: false, message: 'authentication failed' });
        }
        req.login(user, loginErr => {
            if (loginErr) {
                // return next(loginErr);
            }
            else if (returnUrl != undefined)
                return res.json({ success: true, url: returnUrl });
            else return res.json({ success: true });
        });
    })(req, res, next);
}

module.exports.createMediator = function (req, res) {
    model.MediatorModel.findOne({ Email: req.body.email }, function (err, user) {
        if (err) console.log(err.message);
        else {
            if (user) { res.json("User already exists!"); }
            else {
                model.MediatorModel.create({
                    FullName: req.body.fullname,
                    Email: req.body.email,
                    Password: req.body.password,
                    IsVerified: false
                }, function (err, new_user) {
                    // var e = {
                    //     'email': 
                    // }
                    passport.authenticate('local-sign-in', {});
                    req.login(new_user, loginErr => {
                        if (loginErr) {
                            // return next(loginErr);
                        }
                        else res.json(1);
                    });
                });
            }
        }
    });
}

module.exports.getUserName = function (req, res) {
    var user = req.session.code;
    var mediator = req.user;
    var invitee = req.session.SecretToken;
    if (user == undefined && mediator == undefined && invitee == undefined) res.json(0);
    else {
        if (user != undefined || invitee != undefined) res.json(req.session.name);
        if (mediator != undefined) res.json(req.user.FullName);
    }
};

module.exports.getrole = function (req, res) {
    var roles = utility.UserRole.GetRoleName(req);
    if (roles == 'user') res.json({ role: 'user' });
    if (roles == 'mediator') res.json({ role: 'mediator' });
    if (roles == 'invitee') res.json({ role: 'invitee' });
};

module.exports.getnotificationdata = function (req, res) {
    var userId = utility.getCurrentLoggedInUser.id(req, res);
    getUserNotificationData(userId, function (data) {
        var result = {
            'count': data.length,
            'content': data
        }
        res.json(result);
    });
};

function getUserNotificationData(response, callback) {
    model.NotificationModel.find({ ReceiverId: response, IsRead: false }).populate('ChatId').exec(function (err, data) {
        if (data)
            callback(data);
    });
}

module.exports.MarkAsRead = function (req, res) {
    var userId = utility.getCurrentLoggedInUser.id(req);
    model.NotificationModel.update({ ReceiverId: userId }, { IsRead: true }, { multi: true }, function (err, data) {
        if (data)
            res.json(1);
    });
}

module.exports.getRoleById = function (req, res) {
    var id = utility.getCurrentLoggedInUser.id(req, res);
    utility.UserRole.GetRoleNameByUserId(id, function (result) {
        res.json(result);
    });
};

module.exports.popoverdata = function (req, res) {
    model.ProfilePicModel.findOne({ UserId: req.params.id }).sort({ _id: -1 }).exec(function (err, data) {
        utility.UserRole.GetRoleNameByUserId(req.params.id, function (result) {
            var src;
            if (data)
                src = data.Image;
            else
                src = '../Images/u1.png';
            var p = {
                'role': result,
                'src': src
            };
            res.json(p);
        });
    });
};

module.exports.getuserid = function (req, res) {
    var id = utility.getCurrentLoggedInUser.id(req, res);
    res.json(id);
}

// module.exports.allusers = function (req, res) {
//     model.ComplaintModel.find()
//         .exec(function (err, data) {
//             res.json(data);
//         })
// }
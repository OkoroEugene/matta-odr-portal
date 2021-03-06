const index = require('./app');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
var model = require('./models/entitymodels');
var app = index.myApp;
var multer = require('multer');
var rootPath = index.myPath;
var utility = require('./Helpers/utility');
var currentDate = new Date();
var mime = require('mime-types');
var passport = index.myPassport;
var session = require('./Helpers/session');
var auth = require('./Helpers/auth');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
        });
    }
});
module.exports.storage = storage;
var upload = multer({ storage: storage });
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var mail = require('./Helpers/mail');
var sms = require('./Helpers/twilio');
var caseCtrl = require('./controllers/caseController');
var complaintsCtrl = require('./controllers/complaintsCtrl');
var fileCtrl = require('./controllers/fileController');
var authCtrl = require('./controllers/authController');
var profileCtrl = require('./controllers/profileController');
var mediatorCtrl = require('./controllers/mediatorController');
var adminCtrl = require('./controllers/adminController');

// const asyncMiddleware = fn =>
//   (req, res, next) => {
//     Promise.resolve(fn(req, res, next))
//       .catch(next);
//   };
app.use(flash())
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/views/homelayout.html')
});
app.get('/verify/:id', caseCtrl.validateInvitee, function (req, res) {
    if (req.params.id === undefined) res.redirect('/login');
    res.sendFile(__dirname + '/public/views/auth.html')
});
app.get('/login', function (req, res) {
    var returnUrl = req.query.returnUrl;
    if (returnUrl === undefined) {
        req.session.returnUrl = undefined;
    }
    res.sendFile(__dirname + '/public/views/auth.html')
});
app.get('/forgot-password', function (req, res) {
    res.sendFile(__dirname + '/public/views/auth.html')
});
app.get('/change-password', utility.Authorize.all, function (req, res) {
    res.sendFile(__dirname + '/public/views/layout.html')
});
app.get('/reset-password/:id', function (req, res) {
    res.sendFile(__dirname + '/public/views/auth.html')
});
app.post('/login', authCtrl.authenticateUser);
app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/public/views/auth.html')
});
app.post('/register', authCtrl.createMediator);
app.get('/error', function (req, res) {
    res.sendFile(__dirname + '/public/views/error.html')
});
app.get('/error-log', utility.Authorize.admin, function (req, res) {
    res.sendFile(__dirname + '/public/views/admin/adminlayout.html')
});
app.post('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.json(1);
})
app.get('/open-file', function (req, res) {
    res.sendFile(__dirname + '/public/views/auth.html')
});
app.post('/checkcode', fileCtrl.verifyCode);
app.get('/portal', function (req, res) {
    res.sendFile(__dirname + '/public/views/layout.html')
});
app.get('/profile', utility.Authorize.mediator, function (req, res) {
    res.sendFile(__dirname + '/public/views/layout.html')
});
app.post('/openfile', fileCtrl.openFile);
app.post('/genFileNumber', fileCtrl.genFileNumber);
app.get('/new-complaint', utility.Authorize.user, complaintsCtrl.viewNewComplaints);
app.post('/new-complaint', utility.Authorize.user, complaintsCtrl.createComplaint);
app.get('/case/:id', utility.Authorize.all, caseCtrl.viewCase);
app.post('/addchat/:id', caseCtrl.chat);
app.get('/casedata/:id', caseCtrl.caseDetails);
app.get('/casechat/:id', caseCtrl.chatDetails);
app.get('/complaints', utility.Authorize.mediator, mediatorCtrl.getMediatorCases);
app.post('/createcase', caseCtrl.acceptCase);
app.post('/InviteThirdParty', caseCtrl.inviteUser);
app.get('/checkinvite/:id', caseCtrl.checkinvite);
app.post('/uploadfile/:id', upload.array('uploadfile', 6), utility.Authorize.all, caseCtrl.uploadfile)
app.get('/dashboard', utility.Authorize.userandinvitee, complaintsCtrl.pendingcomplaint); //
app.get('/allcomplaints', complaintsCtrl.allcomplaints);

app.get('/validate', function (req, res) {
    if (req.session.fileNumber === undefined)
        res.redirect('/open-file');
    else
        res.sendFile(__dirname + '/public/views/auth.html')
});
app.get('/allmediators', mediatorCtrl.allmediators);
app.get('/checkstatus', complaintsCtrl.pendingcomplaint);
app.get('/getmediatordata', utility.Authorize.mediator, mediatorCtrl.getmediatordata);
app.get('/getprofilepic', authCtrl.getprofilepic);
app.get('/GetMediatorDataById/:id', mediatorCtrl.GetMediatorDataById);
app.get('/getcomplaintdata/:id', complaintsCtrl.getcomplaintdata);
app.post('/addcasepayment/:id', utility.Authorize.mediator, complaintsCtrl.addcomplaintpayment);
app.get('/verifypayment', complaintsCtrl.verifypayment); //
app.post('/makecomplaintpayment/:id', complaintsCtrl.makecomplaintpayment);
app.get('/getMediatorName/:id', mediatorCtrl.getmediatorbycomplaintId);
app.get('/legal-tips', function (req, res) {
    res.sendFile(__dirname + '/public/views/admin/adminlayout.html')
})
app.get('/mediator-profile', utility.Authorize.mediator, function (req, res) {
    res.sendFile(__dirname + '/public/views/layout.html')
})
app.post('/legal-tips')
app.get('/getallcases', utility.Authorize.mediator, mediatorCtrl.getallCases);
app.post('/markasread', authCtrl.MarkAsRead);
app.post('/uploadmediatorimage', upload.single('Image'), mediatorCtrl.uploadMediatorImage);
app.get('/getprofilepic', utility.Authorize.mediator, mediatorCtrl.getprofilepic);
app.get('/getawaitingpayment', utility.Authorize.mediator, complaintsCtrl.getawaitingpayment)
app.get('/user', authCtrl.getUserName);
app.get('/getroles', authCtrl.getrole);
app.get('/notificationcount', authCtrl.getnotificationdata);
app.get('/userrole', authCtrl.getRoleById);
app.get('/getpopoverdata/:id', authCtrl.popoverdata);
app.post('/declinecase/:id', complaintsCtrl.declinecase);
// app.post('/DeclineCaseByComplaintId/:id', complaintsCtrl.DeclineCaseByComplaintId);
app.get('/getNewRegData', fileCtrl.getNewRegData);
app.post('/createmediatorprofile', utility.Authorize.mediator, upload.single('MediatorCert'), mediatorCtrl.createmediatorprofile);
app.post('/uploadmediatorcert', upload.single('MediatorCert'), mediatorCtrl.uploadmediatorcert);
app.get('/existingmediatorprofile', utility.Authorize.mediator, mediatorCtrl.existingmediatorprofile);

app.get('/getuserid', authCtrl.getuserid);
app.get('/GetChatDataById/:id', caseCtrl.GetChatDataById);
app.post('/updatechatcontent/:id', caseCtrl.updatechatcontent);
app.post('/MarkAsResolved/:id', caseCtrl.MarkAsResolved);
app.get('/getInvitee/:id', caseCtrl.getInvitee);
app.post('/regInvitee/:id', caseCtrl.regInvitee);
app.post('/forgotpassword', authCtrl.forgotpassword);
app.get('/GetUserDataByToken/:id', authCtrl.GetUserDataByToken);
app.post('/resetpassword/:id', authCtrl.resetpassword);
app.post('/changepassword', authCtrl.changepassword);
app.get('/filedetails', fileCtrl.filedetails);
app.get('/getErrorLogs', authCtrl.getErrorLogs);





//ADMIN END-POINTS
app.get('/admin/mediators', utility.Authorize.admin, function (req, res) {
    res.sendFile(__dirname + '/public/views/admin/adminlayout.html')
})
app.get('/admin/files', utility.Authorize.admin, function (req, res) {
    res.sendFile(__dirname + '/public/views/admin/adminlayout.html')
})
app.post('/DeleteChatContent/:id', caseCtrl.DeleteChatContent);
app.get('/getcounts', adminCtrl.getcounts);
app.get('/admin/allfiles', utility.Authorize.admin, adminCtrl.allfiles);
app.post('/verifymediator/:id', adminCtrl.verifymediator);
app.post('/unverifymediator/:id', adminCtrl.unverifymediator);
app.get('/admin', utility.Authorize.admin, function (req, res) {
    res.sendFile(__dirname + '/public/views/admin/adminlayout.html')
})
app.get('/admin/complaints', utility.Authorize.admin, function (req, res) {
    res.sendFile(__dirname + '/public/views/admin/adminlayout.html')
})


// app.post('/previewfile', upload.array('Images', 6), utility.Authorize.all, caseCtrl.previewfile)
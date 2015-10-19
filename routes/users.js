var express = require('express');
var router = express.Router();
//require('dotenv').load();
var db = require('monk')(process.env.MONGOLAB_URI);
var students = db.get('students-assessment') // Somehow the name of the db became the identity function of the activity.  Triple pun score.
var users = db.get('users-assessment');
var bcrypt = require('bcrypt');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', {title: "Users With Crud"});
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/signup', function(req, res, next) {
  if(req.session.signedIn) {
    res.redirect('/students')
  }
  var errors = []; // error accumulation
  //console.log(req.body.loginPass, req.body.loginEmail);
  // validate input
  if(req.body.loginPass.length < 8) {
    errors.push("The password must be longer than 8 characters")
  }
  if((new RegExp('^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$').test(req.body.loginEmail))) {
    errors.push("Valid email address required.")
  }
  users.find({
    loginEmail: req.body.loginEmail
  }, function(userEntry) {
    if(userEntry) {
      errors.push("That email is already in use by someone else, or by you")
    }
    if(errors.length < 1) {
      // hash password
      // insert into users db.
      users.insert({
        loginEmail: req.body.loginEmail,
        loginPass: bcrypt.hashSync(req.body.loginPass, 12)
      });
      req.session.signedIn = true;
      req.session.name = req.body.loginEmail;
      res.redirect('/students')
    }
    if(errors.length > 0) {
      res.render('signup', {errors: errors});
    }
  });
});


router.get('/signin', function (req, res, next) {
  if(req.session.name) { req.body.name = req.session.name; }
  else { req.body.name = '';} // if previous attempt at login failed, populate field with name from prev. attempt

  res.render('signin', {
    title: 'the sign in page',
    name: req.body.name
  });
});
// signin is unfinished
router.post('/signin', function(req, res, next) {
  //set cookie
  req.session.name = req.body.name;
  //validate input by checking database
  //check usersdb for password with bcrypt.compare()

  users.findOne({loginEmail:req.body.email}, function(userEntry) {
    if(bcrypt.compareSync(req.body.loginPass, userEntry.loginPass)) {
      req.session.signedIn = true;
      req.session.name = userEntry.loginEmail;
    }
  });
  // if true, login, change cookie , etc...
  res.redirect('/students');
});

router.get('/signout', function(req, res, next) {
  req.session = null; // cookie deleted
  res.redirect('/signin');
});

function authdPredicate (cookie) {
  if(!cookie.signedIn) {
    res.redirect('/signin');
  }
  return null;
}
// only users can use these, so check cookie and redirect if necessary
router.get('/students/add', function(req, res, next) {
  authdPredicate(req.session);
  res.render('addstudent');
});

router.post('/students/add', function(req, res, next) {
  authdPredicate(req.session);
  var errors = [];
  if(req.body.studentname.length < 1) {
    errors.push("The students name must be filled in")
  }
  if((new RegExp('^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$').test(req.body.studentemail))) {
    errors.push("The students email must be a valid email address.")
  }
  if(errors.length > 0 ){
      res.render('addstudent', {
      errors: errors
    });
  }
  if(errors.length < 1) {
    students.insert({
      name: req.body.studentname,
      email: req.body.studentemail
    });
    res.redirect('/students');
  }
});

// since it's student or students, careful of plural vs nonplural
router.get('/students', function(req, res, next) {
  authdPredicate(req.session);
  students.find({}, function(err, studentsList) {
    res.render('students', {
      title: 'Students listing',
      students: studentsList
    });
  });
});

router.get('/students/:id', function(req, res, next) {
  authdPredicate(req.session);
  students.findOne({_id: req.params.id}, function(err, singleStudent) {
    res.render('displaystudent', {
      title: "Single Student Info Display",
      studentname: singleStudent.name,
      studentemail: singleStudent.email
    });
  });
});

module.exports = router;

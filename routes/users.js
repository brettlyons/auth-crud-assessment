var express = require('express');
var router = express.Router();
require('dotenv').load();
var db = require('monk')(process.env.MONGOLAB_URI);
var students = db.get('students-assessment') // Somehow the name of the db became the identity function of the activity.  Triple pun score.
var users = db.get('users-assessment');
var bcrypt = require('bcrypt');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Much /users root, such nothing here');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/signup', function(req, res, next) {
  
  // validate input
  // hash password
  // insert into users db.
});


router.get('/signin', function (req, res, next) {
  if(req.session.name) { req.body.name = req.session.name; }
  else { req.body.name = '';} // if previous attempt at login failed, populate field with name from prev. attempt
  
  res.render('signin', {
    name: req.body.name,
  });
});

router.post('/signin', function(req, res, next) {
  //set cookie
  req.session.name = req.body.name;
  //validate input by checking database
  //check usersdb for password with bcrypt.compare()


  
  // if true, login, change cookie , etc...
  req.session.signedIn = true;
});

router.get('/signout', function(req, res, next) {
  req.session = null; // cookie deleted
  res.render('/signin');
});

function authdPredicate (cookie) {
  if(!cookie.signedIn) {
    res.redirect('/users/signin');
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
  students.insert()
});

// since it's student or students, careful of plural vs nonplural
router.get('/students', function(req, res, next) {
  authdPredicate(req.session);
  students.find({}, function(err, studentsList) {
    res.render('students', { students: studentsList });
  });
});

router.get('/students/:id', function(req, res, next) {
  authdPredicate(req.session);
  students.findOne({_id: req.params.id}, function(err, singleStudent) {
    res.render('student', { student: singleStudent });
  });
});

module.exports = router;

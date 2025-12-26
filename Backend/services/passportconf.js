var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const saltRounds = 10;
var config = require("config");
var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
var UserModel = require("../models/user");



//user login local strategy
passport.use('login', new LocalStrategy({
  usernameField: 'emailid',
  passwordField: 'password',
  passReqToCallback: true
},
  function (req, emailid, password, done) {
    UserModel.findOne({ where: { 'emailid': emailid, 'status': true } }).then(user => {
      if (!user) {
        return done(null, false, {
          success: false,
          message: "Invalid emailid"
        });
      }
      else {
        bcrypt.compare(password, user.password).then(function (res) {
          if (res) {
            return done(null, user, {
              success: true,
              message: "logged in successfully"
            });
          }
          else {
            return done(null, false, {
              success: false,
              message: "Invalid Password"
            });
          }
        });
      }
    }).catch(err => {
      return done(err, false, {
        success: false,
        message: "Server Error"
      });
    });
  }
));




//options jwt
var opts = {}
//opts.jwtFromRequest = ExtractJwt.fromHeader('authorization');
opts.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('Token');
opts.secretOrKey = config.get('jwt.secret');

passport.use('user-token', new JwtStrategy(opts, function (jwt_payload, done) {
  // jwt_payload._id might need to be adjusted if payload structure changes. 
  // Assuming payload still has _id from legacy or id.
  const id = jwt_payload.id || jwt_payload._id;
  UserModel.findByPk(id).then(user => {
    if (user) {
      return done(null, user, {
        success: true,
        message: "Successfull"
      });
    } else {
      return done(null, false, {
        success: false,
        message: "Authentication Failed"
      });
    }
  }).catch(err => {
    return done(err, false, {
      success: false,
      message: "Server Error"
    });
  });
}));




module.exports = passport
var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Prss';

/* Much nicer versions */
router.get('/', function(req, res) {
   var email = req.query.email;

   var handler = function(err, prsArr) {
      res.json(prsArr);
      req.cnn.release();
   };

   if (email)
      req.cnn.chkQry('select id, email from Person where email like ?',
       [email + '%'], handler);
   else {
      req.cnn.chkQry('select id, email from Person', handler);
   }
});

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   //~~~ var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;
                        // Blocking password
   body.whenRegistered = new Date();

   // remove fields with empty string or null values
   if (!body.email)
      delete body.email;
   if (!body.lastName)
      delete body.lastName;
   if (!body.password)
      delete body.password;

   async.waterfall([
   function(cb) { // Check properties and search for Email duplicates
      if (vld.hasFields(body, ["email", "lastName", "password"], cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },
   function(existingPrss, fields, cb) {  // If no duplicates, insert new Person
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   function(result, fields, cb) { // Return location of inserted Person
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.get('/:id', function(req, res) {
   var vld = req.validator;

   if (vld.checkPrsOK(req.params.id)) {
      req.cnn.chkQry('select id, firstName, lastName, email, city, state,' +
       ' zipCode, country from Person where id = ?', [req.params.id],
      function(err, prsArr) {
         if (vld.check(prsArr.length, Tags.notFound)) {
            res.json(prsArr);
         }
         else
            res.end();
         req.cnn.release();
      });
   }
   else {
      req.cnn.release();
   }
});

router.put('/:id', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.params.id, cb) &&
       vld.hasOnlyFields(body, ["firstName", "lastName", "password",
       "oldPassword", "city", "state", "zipCode", "country"])
       .check((!body.password && body.password !== "") || body.oldPassword,
       Tags.noOldPwd, null, cb)) {
         cnn.chkQry('select * from Person where id = ?', [req.params.id], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound,  null, cb) && 
       vld.check(admin || !body.password ||
       qRes[0].password === body.oldPassword, Tags.oldPwdMismatch, null, cb)) {
         delete body.oldPassword;
         cnn.chkQry("update Person set ? where id = ?",
          [body, req.params.id], cb);
      }
   },
   function(updRes, field, cb) {
      res.status(200).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

router.delete('/:id', function(req, res) {
   var vld = req.validator;

   if (vld.checkAdmin())
      req.cnn.chkQry('DELETE from Person where id = ?', [req.params.id],
      function (err, result) {
         if (!err && vld.check(result.affectedRows, Tags.notFound))
            res.status(200).end();
         else
            res.status(400).end();
         req.cnn.release();
      });
   else {
      req.cnn.release();
   }
});

module.exports = router;

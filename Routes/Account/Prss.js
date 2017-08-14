var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');
var pg = require('pg');

router.baseURL = '/Prss';

/* Much nicer versions */
router.get('/', function(req, res) {
   var email = req.query.email;

   var handler = function(err, prsArr) {
      res.json(prsArr);
      req.cnn.release();
   };

   if (email)
      req.cnn.chkQry('select id, email from Person where email like $1',
       [email + '%'], handler);
   else {
      req.cnn.chkQry('select id, email from Person', handler);
   }
});

router.post('/', function(req, res) {

   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;

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
         console.log("Getting existing persons");
         //cnn.chkQry('select * from Person where email = ?', body.email, cb);
         cnn.chkQry('select * from Person where email = $1', [body.email], cb);
      }
   },
   function(existingPrss, fields, cb) {  // If no duplicates, insert new Person
      if (vld.check(!existingPrss.rows.length, Tags.dupEmail, null, cb)) {
         console.log("Inserting person");
         cnn.chkQry('insert into Person set $1', body, cb);
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
      console.log(req.params);
      req.cnn.chkQry('select id, firstName, lastName, email, city, state,' +
       ' zip, country from Person where id = $1', [req.params.id],
      function(err, prsArr) {
         console.log('GOT PERSON');
         console.log(prsArr);
         if (vld.check(prsArr && prsArr.rows && prsArr.rows.length, Tags.notFound)) {
            res.json(prsArr.rows);
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
       "oldPassword", "city", "state", "zip", "country"])
       .check((!body.password && body.password !== "") || body.oldPassword,
       Tags.noOldPwd, null, cb)) {
         cnn.chkQry('select * from Person where id = ?', [req.params.id], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound,  null, cb) && 
       vld.check(!body.password || qRes[0].password === body.oldPassword,
       Tags.oldPwdMismatch, null, cb)) {
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

   if (vld.checkPrsOK(req.params.id, null))
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

router.get('/:id/Rsvs', function(req, res) {
	var vld = req.validator;
	var cnn = req.cnn;
	var prsId = req.params.id;
	var query = 'select r.id, p.firstName, p.lastName, r.status, r.evtId,' +
	 ' e.title, e.date from Reservation r join Event e on r.evtId = e.id' +
	 ' join Person p on r.prsId = p.id where p.id = ?';

   async.waterfall([
   function(cb) {  // Check for existence of person
   	if (vld.checkPrsOK(prsId, cb))
      	cnn.chkQry('select * from Person where id = ?', [prsId], cb);
   },
   function(prss, fields, cb) { // Get indicated reservations
      if (vld.check(prss.length, Tags.notFound, null, cb))
         cnn.chkQry(query, [prsId], cb);
   },
   function(rsvs, fields, cb) { // Return retrieved reservations
      res.json(rsvs);
      cb();
   }],
   function(err){
      cnn.release();
   });
});

router.put('/:id/Rsvs/:rsvId', function(req, res) {
	var vld = req.validator;
	var cnn = req.cnn;
	var prsId = req.params.id;
	var rsvId = req.params.rsvId;
	var body = req.body;
	var query = 'update Reservation set status = ? where id = ?';

	async.waterfall([
   function(cb) {  // Check for existence of person
   	if (vld.checkPrsOK(prsId, cb))
      	cnn.chkQry('select * from Person where id = ?', [prsId], cb);
   },
   function(prss, fields, cb) { // Check for existence of reservation
   	if (vld.check(prss.length, Tags.notFound, null, cb))
   		cnn.chkQry('select * from Reservation where id = ? and prsId = ?', 
   	 	 [rsvId, prsId], cb);
   },
   function(rsvs, fields, cb) { // update indicated reservations
      if (vld.check(rsvs.length, Tags.notFound, null, cb) &&
       vld.check(body.status === "Going" || body.status === "Maybe" ||
       body.status === "Not Going", Tags.badValue, ["status"], cb))
         cnn.chkQry(query, [body.status, rsvId], cb);
   }],
   function(err) {
   	if (!err)
         res.status(200).end();
      cnn.release();
   });
});

module.exports = router;

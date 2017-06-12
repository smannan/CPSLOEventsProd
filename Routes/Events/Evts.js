var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Evts';

router.get('/', function (req, res) {
});

router.post('/', function(req, res) {
});


router.get('/:id', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var priv = 0;
   var body;

   async.waterfall([
   function(cb) {
      cnn.chkQuery('SELECT id, name, organizerId, city, state, zipCode, ' +
       'country, address, time, description, private FROM Events WHERE id = ?',
        [req.params.id], cb);
   }, 
   function(rows, fields, cb) {
      body = fields;
      if (vld.check(rows.length, Tags.notFound, null, cb)) {
         priv = fields.private;
         if (priv && rows[0].organizerId !== req.session.id) {
            cnn.chkQuery('SELECT prsId, evtId FROM Reservation' +
             'WHERE prsId = ? AND evtId = ?',
             [req.session.id, req.params.id], cb);
         } else {
            res.json(rows);
            cnn.release();
            return;
         }
      }
   },
   function(rows, fields, cb) {
      if (vld.check(rows.length, Tags.noPermission, null, cb)) {
         res.json(body);
         cb();
      }
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });
});

router.put('/:id', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var priv = 0;
   var body = req.body;

   if (!body.title)
      delete body.title;
   if (!body.city)
      delete body.city;
   if (!body.state)
      delete body.state;
   if (!body.country)
      delete body.country;
   if (!body.desc)
      delete body.desc;
   if (!body.zip)
      delete body.zip;

   async.waterfall([
   function(cb) {
      cnn.chkQuery('SELECT organizerId FROM Events WHERE id = ?',
        [req.params.id], cb);
   }, 
   function(rows, fields, cb) {
      var handler =  function (err, rows) {
         if (vld.check(!rows.length, Tags.dupTitle, null, cb)
            cb();
      }

      if (vld.check(rows.length, Tags.notFound, null, cb) &&
       vld.checkPrsOk(rows[0].organizerId, cb) &&
       vld.chain((!body.role ||  ) {
         if (body.title)) {
            cnn.chkQry('SELECT * from Events WHERE id <> ? && title = ?',
            [req.params.id, body.title], handler);
         } else {
            cb();
         }
      }
   },
   function(rows, fields, cb) {
      if (vld.check(true)) {
         cnn.chkQry('UPDATE Events SET ? WHERE id = ' + req.params.id,
         body, cb);
      }
   }],
   function(err) {
      if (!err)
         res.status(200).end()
      cnn.release();
   });

});

router.delete('/:id', function(req, res) {
});


router.get('/:id/Rsvs', function(req, res) {
});

router.post('/:id/Rsvs', function(req, res) {
});


router.delete('/:id/Rsvs/:rid', function(req, res) {
});


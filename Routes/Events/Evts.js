var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');
var CnnPool = require('../CnnPool.js');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');

router.baseURL = '/Evts';

router.get('/', function (req, res) {
	var start = req.query.start;
   var end = req.query.end;
   var loc = req.query.loc;
   var owner = req.query.owner; 
   var id = req.session.id;

   var query = 'select id, name, organizerId, ' + 
    'unix_timestamp(time) as time, city, state, ' +
    'country, address, private, description, zipCode ' +
    'from Event join Reservation where (Event.id = ' +
    'Reservation.evtId or Event.private = 0 or ' +
    'Event.organizerId = id)';
   var params = [];

   /* limited to Event organized by
    * the specified owner if query param
    * is given.
   */
   if (owner) {
      query += ' and orgId = ?';
      params.push(parseInt(owner));
   }

   if (start) {
      query += ' and date >= ? '
      params.push(start.getTime())
   }

   if (end) {
      query += ' and date <= ? '
      params.push(end.getTime())
   }

   if (loc) {
      query += ' and zipCode = ? '
      params.push(loc)
   }

   console.log(query)

   req.cnn.chkQry(query, params,
   function(err, evts) {
      if (!err) {
         res.json(evts);
      }
      req.cnn.release();
   });
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      /* Make sure body has a non-empty title, addr, time */
      if (vld.chain(body.title, Tags.missingField, ["title"])
       .chain(body.addr, Tags.missingField, ["address"])
       .check(body.date, Tags.missingField, ["time"], cb)) {

         cnn.chkQry('select * from Event where title = ?', 
          body.title, cb);
      }
   },

   function(existingEvt, fields, cb) {
      /* Check all char limits then  
       * Duplicate title error if the event
       * already exists.
      */
      if (vld.chain(body.title.length < 80, Tags.badValue, null)
       .chain(body.private === 0 || body.private === 1, Tags.badValue, null)
       .chain(body.desc.length < 500, Tags.badValue, null)
       .chain(body.city.length < 50, Tags.badValue, null)
       .chain(body.state.length < 50, Tags.badValue, null)
       .chain(body.country.length < 50, Tags.badValue, null)
       .chain(body.addr.length < 50, Tags.badValue, null)
       .chain(body.zip.length < 50, Tags.badValue, null)
       .check(!existingEvt.length, Tags.dupTitle, null, cb)) {

         body.ownerId = req.session.id;
         console.log(body);
         cnn.chkQry("insert into Event set ?", body, cb);
      }
   },

   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],

   /* Finally, release the db connection */
   function() {
      cnn.release();
   });
});


router.get('/:id', function(req, res) {
});

router.put('/:id', function(req, res) {
});

router.delete('/:id', function(req, res) {
});


router.get('/:id/Rsvs', function(req, res) {
});

router.post('/:id/Rsvs', function(req, res) {
});


router.delete('/:id/Rsvs/:rid', function(req, res) {
});

module.exports = router;
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

   var query = 'select distinct e.id, title, orgId,' +
    ' (extract(epoch from date)) as date, city, state,' +
    ' country, addr, private, descr, zip' +
	 ' from Event e left join Reservation r on e.id = r.evtId' +
	 ' where (e.private = false or e.orgId = ? or r.prsId = ?)';
   var params = [id, id];

   /* limited to Event organized by
    * the specified owner if query param
    * is given.
   */
   if (owner) {
      query += ' and orgId = ?';
      params.push(parseInt(owner));
   }

   if (start) {
      query += ' and (extract(epoch from date)) >= ? ';
      params.push(parseInt(start));
   }

   if (end) {
      query += ' and (extract(epoch from date)) <= ? ';
      params.push(parseInt(end));
   }

   if (loc) {
      query += ' and zip = ? ';
      params.push(loc);
   }

   query += ' order by date asc;';

   console.log(query);
   console.log(params);
   req.cnn.chkQry(query, params,
   function(err, evts) {
      if (!err) {
         res.json(evts.rows);
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
       .chain(body.addr, Tags.missingField, ["addr"])
       .check(body.date, Tags.missingField, ["date"], cb)) {

         cnn.chkQry('select * from Event where title = ?', 
          body.title, cb);
      }
   },

   function(existingEvt, fields, cb) {
      /* Check all char limits then  
       * Duplicate title error if the event
       * already exists.
      */
      if (vld.hasOnlyFields(body,['title','city','state','country','addr',
        'date','descr','private','zip']).check(true,null,null,cb) &&

        vld.chain(body.title.length < 80, Tags.badValue, ['title'])

       .chain(body.date >= 0 && body.date >
        (new Date().getTime()), Tags.badValue, ['date'])

       .chain(!body.descr || body.descr.length < 500, Tags.badValue, ['descr'])

       .chain(!body.city || body.city.length < 50, Tags.badValue, ['city'])

       .chain(!body.state || body.state.length < 50, Tags.badValue, ['state'])
       .chain(!body.country || body.country.length < 50, 
        Tags.badValue, ['country'])

       .chain(body.addr.length < 50, Tags.badValue, ['addr'])
       .chain(!body.zip || body.zip.length < 50, Tags.badValue, ['zip'])
       .check(!existingEvt.length, Tags.dupTitle, null, cb)) {

         body.orgId = req.session.id;
         body.date = new Date(body.date);
         if (body.private === null || body.private === "") {
            body.private = 1;
         }
         console.log(body);
         //cnn.chkQry("insert into Event set ?", body, cb);
         cnn.chkQry("insert into Event " + 
          "(title, orgId, private, city, state, zip, " +
          "country, addr, date, descr) values " + 
          "($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", 
          [body.title,body.orgId,body.private,body.city,
          body.state,body.zip,body.country,body.addr,
          body.date,body.descr], cb);
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
   var vld = req.validator;
   var cnn = req.cnn;
   var priv = 0;
   var body;

   async.waterfall([
   function(cb) {
      cnn.chkQry('SELECT id, title, orgId, city, state, zip, ' +
       'country, addr, (extract(epoch from date)) as date, descr, private '+
       'FROM Event WHERE id = ?',
        [req.params.id], cb);
   }, 
   function(rows, fields, cb) {
      if (vld.check(rows.length, Tags.notFound, null, cb)) {
         rows[0].date *= 1000;
         body = rows;
         priv = rows[0].private;
         if (priv && rows[0].orgId !== req.session.id) {
            cnn.chkQry('SELECT prsId, evtId FROM Reservation ' +
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
   if (!body.descr)
      delete body.descr;
   if (!body.zip)
      delete body.zip;

   async.waterfall([
   function(cb) {
      cnn.chkQry('SELECT orgId FROM Event WHERE id = ?',
        [req.params.id], cb);
   }, 
   function(rows, fields, cb) {
      var now = new Date().getTime(); 
      if (vld.check(rows.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(rows[0].orgId, cb) &&
       vld.check(!body.date || body.date > now, Tags.badValue, 
       ['date'], cb)) {
         if (body.date) {
            body.date = new Date(body.date);
         }
         if (body.title) {
            cnn.chkQry('SELECT * from Event WHERE id <> ? && title = ?',
             [req.params.id, body.title], 
             function (err, rows) {
               if (vld.check(!rows.length, Tags.dupTitle, null, cb)) {
                  cb();
               }

             });
         } else {
            cb();
         }
      }
   },
   function(cb) {
      if(vld.check(true)) {
         cnn.chkQry('UPDATE Event SET ? WHERE id = ' + req.params.id,
          [body], function() {
            cb();
          });
      }
      
      else {
         cb();
      }
   }],
   function(err) {
      if (!err) {
         res.status(200).end()
      }
      cnn.release();
   });

});

router.delete('/:id', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      cnn.chkQry('SELECT orgId FROM Event WHERE id = ?',
       [req.params.id], cb);
   },
   function (rows, fields, cb) {
      if (vld.check(rows.length, Tags.notFound, null) &&
       vld.checkPrsOK(rows[0].orgId)) {
         cnn.chkQry('DELETE FROM Reservation WHERE evtId = ?',
          [req.params.id], cb);
      } else {
         cnn.release();
         return;
      }
   },
   function(rows, fields, cb) {
      cnn.chkQry('DELETE FROM Event WHERE id = ?',
         [req.params.id], cb);
   }
   ],
   function(err) {
      if (!err)
         res.status(200).end();
      cnn.release();
   });

});


router.get('/:id/Rsvs', function(req, res) {
   var vld = req.validator;
   var evtId = req.params.id;
   var prsId = req.session.id;
   var evt;
   var body = req.body;
   var cnn = req.cnn;

   var query = 'select distinct Reservation.id as id, firstName, lastName, status from ' +
   'Event join Reservation join Person where Reservation.prsId ' +
   '= Person.id and evtId = ? order by firstName, lastName asc';

   async.waterfall([
   function(cb) {
      /* Make event exists */
      cnn.chkQry('select * from Event where id = ?', 
       [evtId], cb);
   },

   function(existingEvt, fields, cb) {
      /* Check if user is invited to evtId
      */
      if (vld.check(existingEvt.length, Tags.notFound, null, cb)) {
         evt = existingEvt[0]

         cnn.chkQry('select distinct prsId from Reservation ' + 
          ' where prsId = ? and evtId = ?', 
          [prsId, evtId], cb);
      }
   },

   function(existingRsv, fields, cb) {
      /* If the event is private and the user is invited
      */
      if ((evt.private === 1 && existingRsv.length > 0)
       || evt.private === 0 || evt.orgId === prsId) {
         cnn.chkQry(query, evtId, cb)
      }

      else {
         console.log("private? " + evt.private);
         console.log("existinglen? " + existingRsv.length);
         cnn.chkQry('SELECT NULL', [], cb)
      }
   },

   function(evts, fields, cb) {
      //console.log(evts)

      if (evts.length === 0 || ('NULL' in evts[0])) {
         res.json([]).end();
      }
      else {
         res.json(evts).end();
      }
      cb();
   }],

   /* Finally, release the db connection */
   function() {
      cnn.release();
   });

});

router.post('/:id/Rsvs', function(req, res) {
   var vld = req.validator;
   var id = req.params.id;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Reservation where ' +
       ' prsId = ? and evtId = ?', 
       [body.prsId, id], cb);
   },

   function(existingRsv, fields, cb) {
      console.log("existing: " + existingRsv[0]);

      /* Make sure body has a non-empty person id 
       * And status is either Going, Maybe, or Not Going
       * Event they are RSVP'ing to must exist
      */
      if (vld.check(!existingRsv.length, Tags.dupRsv, null, cb) &&
       vld.chain(!body.status || (body.status==="Going" ||
       body.status==="Maybe" || body.status==="Not Going"), 
       Tags.badValue, ["status"])
       .check(body.prsId, Tags.missingField, ["prsId"], cb)) {

         cnn.chkQry('select * from Event where id = ?', 
          id, cb);
      }
   },

   function(existingEvt, fields, cb) {
      /* Make sure event exists
       * and AU is event organizer OR event is public
      */
      if (vld.check(existingEvt.length, Tags.notFound, null, cb)
       && vld.check(existingEvt[0].private === 0 || 
       existingEvt[0].orgId === req.session.id, Tags.noPermission,
       null, cb)) {

         body.evtId = existingEvt[0].id;

         cnn.chkQry('select * from Person where id = ?', 
          body.prsId, cb);
      }
   },

   function(existingPrs, fields, cb) {
      /* Make sure person in question exists
      */
      if (vld.check(existingPrs.length, Tags.notFound, null, cb)) {

         if (!body.status) {
            body.status = "Not Going";
         }

         console.log(body);
         cnn.chkQry("insert into Reservation set ?", body, cb);
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


router.delete('/:id/Rsvs/:rid', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var priv = 0;
   var body;
   var orgId;

   async.waterfall([
   function(cb) {
      cnn.chkQry('SELECT orgId FROM Event WHERE id = ?',
       [req.params.id], cb);
   },
   function(rows, fields, cb) {
      if (vld.check(rows.length, Tags.notFound, null, cb)) {
         orgId = rows[0].orgId;
         cnn.chkQry('SELECT prsId FROM Reservation WHERE id = ?',
          [req.params.rid], cb);
      }
   }, 
   function(rows, fields, cb) {
      if (vld.check(rows.length, Tags.notFound, null, cb)) {
         if (orgId === req.session.id ||
          vld.checkPrsOK(rows[0].prsId), cb)
            cnn.chkQry('SELECT * FROM Reservation WHERE id = ?',
             [req.params.rid], 
             function(err, rows2) {
               if (vld.check(rows2.length, Tags.notFound, null, cb)) {
                  cnn.chkQry('DELETE FROM Reservation WHERE id = ?',
                   [req.params.rid], cb);
               }
             });
      }
   }],
   function(err) {
      if (!err)
         res.status(200).end()
      cnn.release();
   });
});

module.exports = router;










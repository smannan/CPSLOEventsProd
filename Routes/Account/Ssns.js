var Express = require('express');
var CnnPool = require('../CnnPool.js');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});
var pg = require('pg');

router.baseURL = '/Ssns';

router.post('/', function(req, res) {
   var cookie;
   var cnn = req.cnn;

   console.log('LOGGING IN');
   cnn.query('select * from Person where email = $1', [req.body.email],
   function(err, result) {
      console.log('LOGGING IN');
      console.log(result.rows);
      if (req.validator.check(result.rows.length &&
       result.rows[0].password === req.body.password, Tags.badLogin)) {
         cookie = ssnUtil.makeSession(result.rows[0], res);
         res.location(router.baseURL + '/' + cookie).status(200).end();
      }
      cnn.end();
   });

   // pg.connect(process.env.DATABASE_URL, function(err, client, done) {
   //    client.query('select * from Person where email = $1', [req.body.email],
   //       function(err, result) {
   //          console.log(result.rows.length);
   //          console.log(result.rows[0]);
   //          cookie = ssnUtil.makeSession(result.rows[0], res);
   //          res.location(router.baseURL + '/' + cookie).status(200).end();
   //    })
   // })
});

router.get('/:cookie', function(req, res, next) {
   var cookie = req.params.cookie;
   var vld = req.validator;
   var ssn = ssnUtil.sessions[cookie];
   
   if (vld.check(ssn, Tags.notFound)) {
      if (ssn && vld.checkPrsOK(ssn.id)) {
         res.status(200).json({cookie: cookie, prsId: ssn.id,
          loginTime: ssn.loginTime});
      }
   }
   req.cnn.end();
});

router.delete('/:cookie', function(req, res, next) {
   if (req.validator.check((req.params.cookie ===
    req.cookies[ssnUtil.cookieName]), Tags.noPermission)) {
      ssnUtil.deleteSession(req.params.cookie);
      res.status(200).end();
   }
   req.cnn.end();
});

module.exports = router;
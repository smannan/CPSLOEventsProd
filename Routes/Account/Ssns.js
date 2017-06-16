var Express = require('express');
var CnnPool = require('../CnnPool.js');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});

router.baseURL = '/Ssns';

router.post('/', function(req, res) {
   var cookie;
   var cnn = req.cnn;

   cnn.query('select * from Person where email = ?', [req.body.email],
   function(err, result) {
      if (req.validator.check(result.length &&
       result[0].password === req.body.password, Tags.badLogin)) {
         cookie = ssnUtil.makeSession(result[0], res);
         res.location(router.baseURL + '/' + cookie).status(200).end();
      }
      cnn.release();
   });
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
   req.cnn.release();
});

router.delete('/:cookie', function(req, res, next) {
   if (req.validator.check((req.params.cookie ===
    req.cookies[ssnUtil.cookieName]), Tags.noPermission)) {
      ssnUtil.deleteSession(req.params.cookie);
      res.status(200).end();
   }
   req.cnn.release();
});

module.exports = router;
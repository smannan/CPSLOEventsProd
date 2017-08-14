var mysql = require('mysql');
const pg = require('pg');
var Pool = require('pg-pool')
const connectionString = process.env.DATABASE_URL;

// Constructor for DB connection pool
var CnnPool = function() {
   var poolCfg = require('./connection.json');
   //this.pool = new Pool({connectionString: connectionString});

   poolCfg.connectionLimit = CnnPool.PoolSize;
   this.pool = mysql.createPool(poolCfg);
   //this.pool = pg.createPool(poolCfg);
};

CnnPool.PoolSize = 1;

// Conventional getConnection, drawing from the pool
CnnPool.prototype.getConnection = function(cb) {
   this.pool.getConnection(cb);
};

// Router function for use in auto-creating CnnPool for a request
CnnPool.router = function(req, res, next) {
   console.log("Getting connection");
   //CnnPool.singleton.getConnection(function(err, cnn) {
   pg.connect(connectionString, (err, cnn, done) => {
      if (err)
         res.status(500).json('Failed to get connection' + err);
      else {
         console.log("Connection acquired");
         cnn.chkQry = function(qry, prms, cb) {
            // Run real qry, checking for error
            this.query(qry, prms, function(err, qRes, fields) {
               if (err)
                  res.status(500).json('Failed query ' + qry);
               cb(err, qRes, fields);
            });
         };
         req.cnn = cnn;
         next();
      }
   });
};

// The one (and probably only) CnnPool object needed for the app
CnnPool.singleton = new CnnPool();

module.exports = CnnPool;

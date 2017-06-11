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


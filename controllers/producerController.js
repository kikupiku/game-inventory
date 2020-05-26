let Producer = require('../models/producer');
let Game = require('../models/game');

let async = require('async');

exports.producer_list = function (req, res, next) {
  Producer.find({}, 'company established')
  .sort([['company', 'ascending']])
  .exec(function (err, listProducers) {
    if (err) {
      return next(err);
    }

    res.render('producer_list', { title: 'List of Game Producers', producer_list: listProducers });
  });
};

exports.producer_detail = function (req, res, next) {
  async.parallel({
    producer: function (callback) {
      Producer.findById(req.params.id)
      .exec(callback);
    },

    games: function (callback) {
      Game.find({ 'producer': req.params.id })
      .exec(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    res.render('producer_detail', { title: results.producer.company, producer: results.producer, games: results.games });
  });
};

exports.producer_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Producer create GET');
};

exports.producer_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Producer create POST');
};

exports.producer_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Producer delete GET');
};

exports.producer_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Producer delete POST');
};

exports.producer_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Producer update GET');
};

exports.producer_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Producer update POST');
};

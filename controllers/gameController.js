let Game = require('../models/game');
let Genre = require('../models/genre');
let Platform = require('../models/platform');
let Producer = require('../models/producer');
let Review = require('../models/review');

let async = require('async');

exports.index = function (req, res) {

  async.parallel({
    game_count: function (callback) {
      Game.countDocuments({}, callback);
    },

    producer_count: function (callback) {
      Producer.countDocuments({}, callback);
    },

    platform_count: function (callback) {
      Platform.countDocuments({}, callback);
    },

    genre_count: function (callback) {
      Genre.countDocuments({}, callback);
    },

    review_count: function (callback) {
      Review.countDocuments({}, callback);
    },

    wishlist_count: function (callback) {
      Game.countDocuments({ isOnWishlist: 'Wanted' }, callback);
    },
  }, function (err, results) {
    res.render('index', { title: 'Game Inventory', error: err, data: results });
  });
};

exports.game_list = function (req, res) {
  res.send('NOT IMPLEMENTED: Game list');
};

exports.game_detail = function (req, res) {
  res.send('NOT IMPLEMENTED: Game detail: ' + req.params.id);
};

exports.game_wishlist = function (req, res) {
  res.send('place for all the wishlisted games');
};

exports.game_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Game create GET');
};

exports.game_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Game create POST');
};

exports.game_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Game delete GET');
};

exports.game_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Game delete POST');
};

exports.game_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Game update GET');
};

exports.game_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Game update POST');
};

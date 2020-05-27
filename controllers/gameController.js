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

exports.game_create_get = function (req, res) {
  res.render('game_form', { title: 'Create new Game' });
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

exports.game_detail = function (req, res, next) {
  async.parallel({
    game: function (callback) {
      Game.findById(req.params.id)
      .populate('producer')
      .populate('platform')
      .populate('genre')
      .exec(callback);
    },

    reviews: function (callback) {
      Review.find({ 'game': req.params.id })
      .exec(callback);
    },

    referrer: function (callback) {
      let referrerURL = req.get('Referrer');
      let referrer = referrerURL.substring(referrerURL.lastIndexOf('/') + 1);
      callback(null, referrer);
    },

    higherReferrer: function (callback) {
      let referrerURL = req.get('Referrer');
      let urlBits = referrerURL.split('/');
      let higherReferrer = urlBits[urlBits.length - 2] + '/' + urlBits[urlBits.length - 1];
      callback(null, higherReferrer);
    },

  }, function (err, results) {
      if (err) {
        return next(err);
      }

      if (results.game === null) {
        let err = new Error('Game not found');
        err.status = 404;
        return next(err);
      }

      res.render('game_detail', { title: results.game.title, game: results.game, reviews: results.reviews, referrer: results.referrer, higherReferrer: results.higherReferrer });
    });
};

exports.game_list = function (req, res, next) {
  Game.find({}, 'title producer premiere')
  .populate('producer')
  .sort([['title', 'ascending']])
  .exec(function (err, listGames) {
    if (err) {
      return next(err);
    }

    res.render('game_list', { title: 'List of Games', game_list: listGames });
  });
};


exports.game_wishlist = function (req, res, next) {
  Game.find({ isOnWishlist: 'Wanted' })
  .populate('genre')
  .sort([['name', 'ascending']])
  .exec(function (err, wishlisted) {
    if (err) {
      return next(err);
    }

    res.render('wishlist', { title: 'Wishlist', wishlisted: wishlisted });
  });
};

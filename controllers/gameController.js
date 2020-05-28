let Game = require('../models/game');
let Genre = require('../models/genre');
let Platform = require('../models/platform');
let Producer = require('../models/producer');
let Review = require('../models/review');

let async = require('async');
const validator = require('express-validator');

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

exports.game_create_get = function (req, res, next) {
  async.parallel({
    producers: function (callback) {
      Producer.find(callback);
    },

    platforms: function (callback) {
      Platform.find(callback);
    },

    genres: function (callback) {
      Genre.find(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    res.render('game_form', { title: 'Create new Game', producers: results.producers, platforms: results.platforms, genres: results.genres });
  });
};

exports.game_create_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }

    if (!(req.body.platform instanceof Array)) {
      if (typeof req.body.platform === 'undefined') {
        req.body.platform = [];
      } else {
        req.body.platform = new Array(req.body.platform);
      }
    }

    next();
  },

  validator.body('title', 'There has to be a title').trim().isLength({ min: 1 }),
  validator.body('producer', 'There has to be a producer').trim().isLength({ min: 1 }),
  validator.body('summary').optional({ checkFalsy: true }).trim(),
  validator.body('premiere').trim().optional({ checkFalsy: true }),

  validator.sanitizeBody('title').escape(),
  validator.sanitizeBody('producer').escape(),
  validator.sanitizeBody('summary').escape(),
  validator.sanitizeBody('premiere').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    let game = new Game({
      title: req.body.title,
      producer: req.body.producer,
      summary: req.body.summary,
      platform: req.body.platform,
      premiere: req.body.premiere,
      genre: req.body.genre,
      isOnWishlist: req.body.isOnWishlist,
    });

    if (!errors.isEmpty()) {
      async.parallel({
        producers: function (callback) {
          Producer.find(callback);
        },

        platforms: function (callback) {
          Platform.find()
          .sort([['name', 'ascending']])
          .exec(callback);
        },

        genres: function (callback) {
          Genre.find(callback);
        },

      }, function (err, results) {
        if (err) {
          return next(err);
        }

        for (let i = 0; i < results.platforms.length; i++) {
          if (game.platform.indexOf(results.platforms[i]._id) >= 0) {
            results.platforms[i].checked = 'true';
          }
        }

        for (let i = 0; i < results.genres.length; i++) {
          if (game.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }

        console.log('isOnWishlist: ', req.body.isOnWishlist);

        res.render('game_form', { title: 'Create new Game', producers: results.producers, platforms: results.platforms, genres: results.genres, checkedStatus: req.body.isOnWishlist, game: req.body, errors: errors.array() });
      });

      return;
    } else {
      game.save(function (err) {
        if (err) {
          return next(err);
        }

        res.redirect(game.url);
      });
    }
  },
];

exports.game_delete_get = function (req, res, next) {
  async.parallel({
    game: function (callback) {
      Game.findById(req.params.id)
      .exec(callback);
    },

    reviewsOfGame: function (callback) {
      Review.find({ 'game': req.params.id })
      .exec(callback);
    },

    referrer: function (callback) {
      let referrerURL = req.get('Referrer');
      let referrer = referrerURL.substring(referrerURL.lastIndexOf('/') + 1);
      callback(null, referrer);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    if (results.game === null) {
      res.redirect('/games');
    }

    res.render('game_delete', { title: 'Delete Game', game: results.game, reviewsOfGame: results.reviewsOfGame, referrer: results.referrer });
  });
};

exports.game_delete_post = function (req, res, next) {
  async.parallel({
    game: function (callback) {
      Game.findById(req.params.idToDelete)
      .exec(callback);
    },

    reviewsOfGame: function (callback) {
      Review.find({ 'game': req.params.idToDelete })
      .exec(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    if (results.reviewsOfGame.length > 0) {
      res.render('game_delete', { title: 'Delete Game', game: results.game, reviewsOfGame: results.reviewsOfGame, referrer: results.referrer });
      return;
    } else {
      Game.findByIdAndRemove(req.body.idToDelete, function deleteGame(err) {
        if (err) {
          return next(err);
        }

        res.redirect('/games');
      });
    }
  });
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

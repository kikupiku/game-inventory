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

//
//
// GAME DETAIL
//
//

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

      let unescapedSummary = (results.game.summary).replace(/&#x27;/g, '\'');

      res.render('game_detail', {
        title: results.game.title,
        game: results.game,
        reviews: results.reviews,
        unescapedSummary: unescapedSummary,
        referrer: results.referrer,
        higherReferrer: results.higherReferrer,
       });
    });
};

//
//
// GAME LIST
//
//

exports.game_list = function (req, res, next) {
  async.parallel({
    listGames: function (callback) {
      Game.find({}, 'title producer premiere')
      .populate('producer')
      .sort([['title', 'ascending']])
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

    res.render('game_list', { title: 'List of Games', game_list: results.listGames, referrer: results.referrer });
  });
};

//
//
// WISHLIST
//
//

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

//
//
// CREATE GET
//
//

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

//
//
// CREATE POST
//
//

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
  validator.body('platform', 'There has to be at least one platform where you can play this game').trim().isLength({ min: 1 }),
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

        let selectedProducerId = req.body.producer.toString();
        res.render('game_form', {
          title: 'Create new Game',
          producers: results.producers,
          platforms: results.platforms,
          genres: results.genres,
          checkedStatus: req.body.isOnWishlist,
          selectedProducerId: selectedProducerId,
          game: game,
          errors: errors.array(),
        });
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

//
//
// DELETE GET
//
//

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

    res.render('game_delete', {
      title: 'Delete Game',
      game: results.game,
      reviewsOfGame: results.reviewsOfGame,
      referrer: results.referrer,
    });
  });
};

//
//
// DELETE POST
//
//

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
      res.render('game_delete', {
        title: 'Delete Game',
        game: results.game,
        reviewsOfGame: results.reviewsOfGame,
        referrer: results.referrer,
      });
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

//
//
// UPDATE GET
//
//

exports.game_update_get = function (req, res, next) {
  async.parallel({
    game: function (callback) {
      Game.findById(req.params.id)
      .populate('producer')
      .populate('platform')
      .populate('genre')
      .exec(callback);
    },

    producers: function (callback) {
      Producer.find(callback);
    },

    platforms: function (callback) {
      Platform.find(callback);
    },

    genres: function (callback) {
      Genre.find(callback);
    },

    referrer: function (callback) {
      let referrerURL = req.get('Referrer');
      let referrer = referrerURL.substring(referrerURL.lastIndexOf('/') + 1);
      callback(null, referrer);
    },
  }, function (err, results) {
    if (err) {
      next(err);
    }

    if (results.game == null) {
      let err = new Error('Game not found');
      err.status = 404;
      return next(err);
    }

    for (let allPlatformsIndex = 0; allPlatformsIndex < results.platforms.length; allPlatformsIndex++) {
      for (let thisGamePlatformsIndex = 0; thisGamePlatformsIndex < results.game.platform.length; thisGamePlatformsIndex++) {
        if (results.platforms[allPlatformsIndex]._id.toString() === results.game.platform[thisGamePlatformsIndex]._id.toString()) {
          results.platforms[allPlatformsIndex].checked = 'true';
        }
      }
    }

    for (let allGenresIndex = 0; allGenresIndex < results.genres.length; allGenresIndex++) {
      for (let thisGameGenresIndex = 0; thisGameGenresIndex < results.game.genre.length; thisGameGenresIndex++) {
        if (results.genres[allGenresIndex]._id.toString() === results.game.genre[thisGameGenresIndex]._id.toString()) {
          results.genres[allGenresIndex].checked = 'true';
        }
      }
    }

    let selectedProducerId = results.game.producer._id;
    let checkedStatus = results.game.isOnWishlist;
    res.render('game_form', { title: 'Update Game',
      game: results.game,
      producers: results.producers,
      platforms: results.platforms,
      genres: results.genres,
      referrer: results.referrer,
      checkedStatus: checkedStatus,
      selectedProducerId: selectedProducerId,
    });
  });
};

//
//
// UPDATE POST
//
//

exports.game_update_post = [
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
  validator.body('platform', 'There has to be at least one platform where you can play this game').trim().isLength({ min: 1 }),
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
      genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
      isOnWishlist: req.body.isOnWishlist,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
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

        let selectedProducerId = game.producer._id;
        let checkedStatus = game.isOnWishlist;
        res.render('game_form', {
          title: 'Update Book',
          producers: results.producers,
          platforms: results.platforms,
          genres: results.genres,
          game: game,
          checkedStatus: checkedStatus,
          selectedProducerId: selectedProducerId,
          errors: errors.array(),
        });
      });

      return;
    } else {
      Game.findByIdAndUpdate(req.params.id, game, {}, function (err, updatedBook) {
        if (err) {
          return next(err);
        }

        res.redirect(updatedBook.url);
      });
    }
  },
];

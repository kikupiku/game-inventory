let Review = require('../models/review');
let Game = require('../models/game');

let async = require('async');
let validator = require('express-validator');

exports.review_list = function (req, res, next) {
  async.parallel({
    listReviews: function (callback) {
      Review.find({}, 'game sourcePage rating')
      .populate('game')
      .sort([['game', 'ascending']])
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

    res.render('review_list', {
      title: 'List of Reviews',
      review_list: results.listReviews,
      referrer: results.referrer,
    });
  });
};

exports.review_detail = function (req, res, next) {
  async.parallel({
    review: function (callback) {
      Review.findById(req.params.id)
      .populate('game')
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

    let unescapedLink = (results.review.link).replace(/&#x2F;/g, '/');
    let unescapedRating = (results.review.rating).replace(/&#x2F;/g, '/');
    let unescapedSnippet = (results.review.content).replace(/&#x27;/g, '\'');

    res.render('review_detail', {
      title: 'Review of ',
      review: results.review,
      referrer: results.referrer,
      unescapedLink: unescapedLink,
      unescapedRating: unescapedRating,
      unescapedSnippet: unescapedSnippet,
    });
  });
};

exports.review_create_get = function (req, res, next) {
  Game.find({}, 'title')
  .exec(function (err, games) {
    if (err) {
      return next(err);
    }

    res.render('review_form', { title: 'Add new Review', games: games });
  });
};

exports.review_create_post = [
  validator.body('game', 'Game must be specified').trim().isLength({ min: 1 }),
  validator.body('sourcePage', 'Review cannot be anonymous').trim().isLength({ min: 1 }),
  validator.body('content').trim().optional({ checkFalsy: true }),
  validator.body('rating', 'Please fill in the rating. If you cannot find it, write \'-\'').trim().isLength({ min: 1 }),
  validator.body('link', 'Invalid website url').trim().isURL().optional({ checkFalsy: true }),

  validator.sanitizeBody('game, sourcePage, content, rating, link').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    let review = new Review({
      game: req.body.game,
      sourcePage: req.body.sourcePage,
      content: req.body.content,
      rating: req.body.rating,
      link: req.body.link,
    });

    if (!errors.isEmpty() || req.body.auth !== process.env.AUTH_PASSWORD) {
      Game.find({}, 'title').exec(function (err, games) {
        if (err) {
          return next(err);
        }

        let unescapedLink = req.body.link.replace(/&#x2F;/g, '/');
        let unescapedRating = req.body.rating.replace(/&#x2F;/g, '/');
        let unescapedSnippet = review.content.replace(/&#x27;/g, "'");

        let errorsList = errors.array();

        if (req.body.auth !== process.env.AUTH_PASSWORD) {
          errorsList.push({
            value: '',
            msg: 'You have to enter the correct authorization password',
            param: 'auth',
            location: 'body',
          });
        } 

        res.render('review_form', {
          title: 'Add new Review',
          games: games,
          review: review,
          unescapedLink: unescapedLink,
          unescapedRating: unescapedRating,
          unescapedSnippet: unescapedSnippet,
          selectedGame: review.game._id,
          errors: errorsList,
        });
      });

      return;
    } else {
      review.save(function (err) {
        if (err) {
          return next(err);
        }

        res.redirect(review.url);
      });
    }
  },
];

exports.review_delete_get = function (req, res, next) {
  async.parallel({
    review: function (callback) {
      Review.findById(req.params.id)
      .populate('game')
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

    if (results.review == null) {
      res.redirect('/reviews');
    }

    res.render('review_delete', { 
      title: 'Delete review', 
      review: results.review, 
      referrer: results.referrer 
    });
  });
};

exports.review_delete_post = function (req, res, next) {
  Review.findById(req.body.idToDelete)
  .populate('game')
  .exec(function (err, review) {
    if (err) {
      return next(err);
    }

    if (req.body.auth !== process.env.AUTH_PASSWORD) {
      res.render('review_delete', {
        title: 'Delete review',
        review: review,
        authError: true
      });
      return;
    } else {
      Review.findByIdAndRemove(req.body.idToDelete, function deleteReview(err) {
        if (err) {
          return next(err);
        }

        res.redirect('/reviews');
      });
    }
  });
};

exports.review_update_get = function (req, res, next) {
  async.parallel({
    review: function (callback) {
      Review.findById(req.params.id)
      .populate('game')
      .exec(callback);
    },

    games: function (callback) {
      Game.find()
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

    if (results.review === null) {
      let err = new Error('Game not found');
      err.status = 404;
      return next(err);
    }

    let unescapedLink = (results.review.link).replace(/&#x2F;/g, '/');
    let unescapedRating = (results.review.rating).replace(/&#x2F;/g, '/');
    let unescapedSnippet = (results.review.content).replace(/&#x27;/g, '\'');

    res.render('review_form', {
      title: 'Update review',
      review: results.review,
      games: results.games,
      referrer: results.referrer,
      unescapedLink: unescapedLink,
      unescapedRating: unescapedRating,
      unescapedSnippet: unescapedSnippet,
    });
  });
};

// UPDATE_POST

exports.review_update_post = [
  validator.body('game', 'Game must be specified').trim().isLength({ min: 1 }),
  validator.body('sourcePage', 'Review cannot be anonymous').trim().isLength({ min: 1 }),
  validator.body('content').trim().optional({ checkFalsy: true }),
  validator.body('rating', 'Please fill in the rating. If you cannot find it, write \'-\'').trim().isLength({ min: 1 }),
  validator.body('link', 'Invalid website url').trim().isURL().optional({ checkFalsy: true }),

  validator.sanitizeBody('game, sourcePage, content, rating, link').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    let review = new Review({
      game: req.body.game,
      sourcePage: req.body.sourcePage,
      content: req.body.content,
      rating: req.body.rating,
      link: req.body.link,
      _id: req.params.id,
    });

    Game.find({})
    .exec(function (err, games) {
      if (err) {
        return next(err);
      }

      if (!errors.isEmpty() || req.body.auth !== process.env.AUTH_PASSWORD) {

        console.log('eeeeeeeeeeerrrrr: ', req.body.auth);

        let unescapedLink = review.link.replace(/&#x2F;/g, '/');
        let unescapedRating = review.rating.replace(/&#x2F;/g, '/');
        let unescapedSnippet = review.content.replace(/&#x27;/g, "'");

        let errorsList = errors.array();

        
        if (req.body.auth !== process.env.AUTH_PASSWORD) {
          errorsList.push({
            value: '',
            msg: 'You have to enter the correct authorization password',
            param: 'auth',
            location: 'body',
          });
        }

        console.log('gamesssssssssssssssss: ', games);
        
        res.render('review_form', {
          title: 'Update review',
          review: review,
          games: games,
          unescapedLink: unescapedLink,
          unescapedRating: unescapedRating,
          unescapedSnippet: unescapedSnippet,
          errors: errorsList,
        });

        return;
      } else {
        Review.findByIdAndUpdate(req.params.id, review, {}, function (
          err,
          updatedReview
        ) {
          if (err) {
            return next(err);
          }

          res.redirect(updatedReview.url);
        });
      }
    });
  },
];

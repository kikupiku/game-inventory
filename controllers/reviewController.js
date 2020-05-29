let Review = require('../models/review');
let Game = require('../models/game');

let async = require('async');
let validator = require('express-validator');

exports.review_list = function (req, res, next) {
  Review.find({}, 'game sourcePage rating')
  .populate('game')
  .sort([['game', 'ascending']])
  .exec(function (err, listReviews) {
    if (err) {
      return next(err);
    }

    res.render('review_list', { title: 'List of Reviews', review_list: listReviews });
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

    res.render('review_detail', { title: 'Review of ', review: results.review, referrer: results.referrer });
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

  // validator.sanitizeBody('*').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    let review = new Review({
      game: req.body.game,
      sourcePage: req.body.sourcePage,
      content: req.body.content,
      rating: req.body.rating,
      link: req.body.link,
    });

    if (!errors.isEmpty()) {
      Game.find({}, 'title')
      .exec(function (err, games) {
        if (err) {
          return next(err);
        }

        let unescapedLink = unescape(req.body.link);
        let unescapedRating = unescape(req.body.rating);

        res.render('review_form', { title: 'Add new Review', games: games, review: review, unescapedlink: unescapedLink, unescapedRating: unescapedRating, selectedGame: review.game._id, errors: errors.array() });
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

    res.render('review_delete', { title: 'Delete review', review: results.review, referrer: results.referrer });
  });
};

exports.review_delete_post = function (req, res, next) {
  Review.findById(req.body.idToDelete)
  .populate('game')
  .exec(function (err, review) {
    if (err) {
      return next(err);
    }

    Review.findByIdAndRemove(req.body.idToDelete, function deleteReview(err) {
      if (err) {
        return next(err);
      }

      res.redirect('/reviews');
    });
  });
};

exports.review_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Review update GET');
};

exports.review_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Review update POST');
};

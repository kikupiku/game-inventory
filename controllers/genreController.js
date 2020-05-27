let Genre = require('../models/genre');
let Game = require('../models/game');

let async = require('async');
const validator = require('express-validator');

exports.genre_list = function (req, res, next) {
  Genre.find({}, 'label')
  .sort([['label', 'ascending']])
  .exec(function (err, listGenres) {
    if (err) {
      return next(err);
    }

    res.render('genre_list', { title: 'List of Genres', genre_list: listGenres });
  });
};

exports.genre_detail = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id)
      .exec(callback);
    },

    games: function (callback) {
      Game.find({ 'genre': req.params.id })
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

    res.render('genre_detail', { title: 'Genre: ', genre: results.genre, games: results.games, referrer: results.referrer });
  });
};

exports.genre_create_get = function (req, res, next) {
  res.render('genre_form', { title: 'Create new Genre' });
};

exports.genre_create_post = [
  validator.body('label', 'Genre name is required').trim().isLength({ min: 1 }),
  validator.sanitizeBody('label').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);
    let genre = new Genre({
      label: req.body.label,
    });

    if (!errors.isEmpty()) {
      res.render('genre_form', { title: 'Create new Genre', genre: genre, errors: errors.array() });
      return;
    } else {
      Genre.findOne({ 'label': req.body.label })
      .exec(function (err, foundGenre) {
        if (err) {
          return next(err);
        }

        if (foundGenre) {
          res.redirect(foundGenre.url);
        } else {
          genre.save(function (err) {
            if (err) {
              return next(err);
            }

            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

exports.genre_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete GET');
};

exports.genre_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

exports.genre_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

exports.genre_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre update POST');
};

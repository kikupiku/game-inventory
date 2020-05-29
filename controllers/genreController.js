let Genre = require('../models/genre');
let Game = require('../models/game');

let async = require('async');
const validator = require('express-validator');

exports.genre_list = function (req, res, next) {
  async.parallel({
    listGenres: function (callback) {
      Genre.find({}, 'label')
      .sort([['label', 'ascending']])
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

    res.render('genre_list', {
      title: 'List of Genres',
      genre_list: results.listGenres,
      referrer: results.referrer,
    });
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

exports.genre_delete_get = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id)
      .exec(callback);
    },

    gamesWithGenre: function (callback) {
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

    if (results.genre === null) {
      res.redirect('/genres');
    }

    res.render('genre_delete', { title: 'Delete genre', genre: results.genre, gamesWithGenre: results.gamesWithGenre, referrer: results.referrer });
  });
};

exports.genre_delete_post = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.body.idToDelete)
      .exec(callback);
    },

    gamesWithGenre: function (callback) {
      Game.find({ 'genre': req.body.idToDelete })
      .exec(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    if (results.gamesWithGenre.length > 0) {
      res.render('genre_delete', { title: 'Delete genre', genre: results.genre, gamesWithGenre: results.gamesWithGenre });
      return;
    } else {
      Genre.findByIdAndRemove(req.body.idToDelete, function deleteGenre(err) {
        if (err) {
          return next(err);
        }

        res.redirect('/genres');
      });
    }
  });
};

exports.genre_update_get = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id)
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

    if (results.genre === null) {
      let err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }

    res.render('genre_form', {
      title: 'Update genre',
      genre: results.genre,
      referrer: results.referrer,
    });
  });
};

exports.genre_update_post = [
  validator.body('label', 'Genre name is required').trim().isLength({ min: 1 }),
  validator.sanitizeBody('label').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    let genre = new Genre({
      label: req.body.label,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Update genre',
        genre: genre,
        errors: errors.array(),
      });

      return;
    } else {
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, updatedGenre) {
        if (err) {
          return next(err);
        }

        res.redirect(updatedGenre.url);
      });
    }
  },
];

let Genre = require('../models/genre');
let Game = require('../models/game');

let async = require('async');

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
  Genre.findById(req.params.id)
  .exec(function (err, genre) {
    if (err) {
      return next(err);
    }

    res.render('genre_detail', { title: 'Genre: ', genre: genre });
  });
};

exports.genre_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre create GET');
};

exports.genre_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Genre create POST');
};

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

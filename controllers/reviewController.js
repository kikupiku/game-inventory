let Review = require('../models/review');

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

exports.review_detail = function (req, res) {
  res.send('NOT IMPLEMENTED: Review detail: ' + req.params.id);
};

exports.review_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Review create GET');
};

exports.review_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Review create POST');
};

exports.review_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Review delete GET');
};

exports.review_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Review delete POST');
};

exports.review_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Review update GET');
};

exports.review_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Review update POST');
};

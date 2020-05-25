let Game = require('../models/game');

exports.index = function (req, res) {
  res.send('NOT IMPLEMENTED: Site Home Page');
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

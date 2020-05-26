let Platform = require('../models/platform');

exports.platform_list = function (req, res, next) {
  Platform.find({}, 'name detail')
  .sort([['name', 'ascending']])
  .exec(function (err, listPlatforms) {
    if (err) {
      return next(err);
    }

    res.render('platform_list', { title: 'List of Gaming Platforms', platform_list: listPlatforms });
  });
};

exports.platform_detail = function (req, res, next) {
  Platform.findById(req.params.id)
  .exec(function (err, platform) {
    if (err) {
      return next(err);
    }

    res.render('platform_detail', { title: 'platform', platform: platform });
  });
};

exports.platform_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Platform create GET');
};

exports.platform_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Platform create POST');
};

exports.platform_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Platform delete GET');
};

exports.platform_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Platform delete POST');
};

exports.platform_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Platform update GET');
};

exports.platform_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Platform update POST');
};

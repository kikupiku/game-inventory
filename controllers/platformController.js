let Platform = require('../models/platform');

let async = require('async');
const validator = require('express-validator');

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
  async.parallel({
    platform: function (callback) {
      Platform.findById(req.params.id)
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

    res.render('platform_detail', { title: 'platform', platform: results.platform, referrer: results.referrer });
  });
};

exports.platform_create_get = function (req, res) {
  res.render('platform_form', { title: 'Create new Platform' });
};

exports.platform_create_post = [
  validator.body('name', 'Platform type cannot be empty').trim().isLength({ min: 1 }),
  validator.body('detail', 'Platform detail cannot be empty').trim().isLength({ min: 1 }),
  validator.sanitizeBody('name').escape(),
  validator.sanitizeBody('detail').escape(),

  (req, res, next) => {
    let errors = validator.validationResult(req);

    let platform = new Platform({
      name: req.body.name,
      detail: req.body.detail,
    });

    if (!errors.isEmpty()) {
      res.render('platform_form', { title: 'Create new Platform', platform: req.body, errors: errors.array() });
      return;
    } else {
      Platform.findOne({ 'detail': req.body.detail })
      .exec(function (err, foundPlatform) {
        if (err) {
          return next(err);
        }

        if (foundPlatform) {
          res.redirect(foundPlatform.url);
        } else {
          platform.save(function (err) {
            if (err) {
              return next(err);
            }

            res.redirect(platform.url);
          });
        }

      });
    }
  },
];

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

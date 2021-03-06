let Platform = require('../models/platform');
let Game = require('../models/game');

let async = require('async');
const validator = require('express-validator');

exports.platform_list = function (req, res, next) {
  async.parallel({
    listPlatforms: function (callback) {
      Platform.find({}, 'name detail')
      .sort([['name', 'ascending']])
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

    res.render('platform_list', {
      title: 'List of Gaming Platforms',
      platform_list: results.listPlatforms,
      referrer: results.referrer,
    });
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

    if (!errors.isEmpty() || req.body.auth !== process.env.AUTH_PASSWORD) {

      let errorsList = errors.array();

      if (req.body.auth !== process.env.AUTH_PASSWORD) {
        errorsList.push({
          value: '',
          msg: 'You have to enter the correct authorization password',
          param: 'auth',
          location: 'body',
        });
      } 

      res.render('platform_form', {
        title: 'Create new Platform',
        platform: req.body,
        errors: errorsList,
      });
      return;
    } else {
      Platform.findOne({ detail: req.body.detail }).exec(function (
        err,
        foundPlatform
      ) {
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

exports.platform_delete_get = function (req, res, next) {
  async.parallel({
    platform: function (callback) {
      Platform.findById(req.params.id)
      .exec(callback);
    },

    gamesOnPlatform: function (callback) {
      Game.find({ 'platform': req.params.id })
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

    if (results.platform  == null) {
      res.redirect('/platforms');
    }

    res.render('platform_delete', { title: 'Delete Platform', platform: results.platform, gamesOnPlatform: results.gamesOnPlatform, referrer: results.referrer });
  });
};

exports.platform_delete_post = function (req, res, next) {
  async.parallel({
    platform: function (callback) {
      Platform.findById(req.body.idToDelete)
      .exec(callback);
    },

    gamesOnPlatform: function (callback) {
      Game.find({ 'platform': req.body.idToDelete })
      .exec(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    if (results.gamesOnPlatform > 0) {
      res.render('platform_delete', { 
        title: 'Delete Platform', 
        platform: results.platform, 
        gamesOnPlatform: results.gamesOnPlatform
      });
    } else if (results.gamesOnPlatform == 0  && req.body.auth !== process.env.AUTH_PASSWORD) {
      res.render('platform_delete', {
        title: 'Delete Platform',
        platform: results.platform,
        gamesOnPlatform: results.gamesOnPlatform,
        authError: true
      });
    } else {
      Platform.findByIdAndRemove(
        req.body.idToDelete,
        function deletePlatform(err) {
          if (err) {
            return next(err);
          }

          res.redirect('/platforms');
        }
      );
    }
  });
};

exports.platform_update_get = function (req, res, next) {
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

    if (results.platform === null) {
      let err = new Error('Platform not found');
      err.status = 404;
      return next(err);
    }

    res.render('platform_form', {
      title: 'Update platform',
      platform: results.platform,
      referrer: results.referrer,
    });
  });
};

// UPDATE_POST

exports.platform_update_post = [
  validator.body('name', 'Platform type cannot be empty').trim().isLength({ min: 1 }),
  validator.body('detail', 'Platform detail cannot be empty').trim().isLength({ min: 1 }),
  validator.sanitizeBody('name').escape(),
  validator.sanitizeBody('detail').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    let platform = new Platform({
      name: req.body.name,
      detail: req.body.detail,
      _id: req.params.id,
    });

    if (!errors.isEmpty() || req.body.auth !== process.env.AUTH_PASSWORD) {
      let errorsList = errors.array();

      if (req.body.auth !== process.env.AUTH_PASSWORD) {
        errorsList.push({
          value: '',
          msg: 'You have to enter the correct authorization password',
          param: 'auth',
          location: 'body',
        });
      }

      res.render('platform_form', {
        title: 'Update platform',
        platform: platform,
        errors: errorsList,
      });

      return;
    } else {
      Platform.findByIdAndUpdate(req.params.id, platform, {}, function (
        err,
        updatedPlatform
      ) {
        if (err) {
          return next(err);
        }

        res.redirect(updatedPlatform.url);
      });
    }
  },
];

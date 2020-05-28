let Producer = require('../models/producer');
let Game = require('../models/game');

let async = require('async');
const validator = require('express-validator');

exports.producer_list = function (req, res, next) {
  Producer.find({}, 'company established')
  .sort([['company', 'ascending']])
  .exec(function (err, listProducers) {
    if (err) {
      return next(err);
    }

    res.render('producer_list', { title: 'List of Game Producers', producer_list: listProducers });
  });
};

exports.producer_detail = function (req, res, next) {
  async.parallel({
    producer: function (callback) {
      Producer.findById(req.params.id)
      .exec(callback);
    },

    games: function (callback) {
      Game.find({ 'producer': req.params.id })
      .exec(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    res.render('producer_detail', { title: results.producer.company, producer: results.producer, games: results.games });
  });
};

exports.producer_create_get = function (req, res) {
  res.render('producer_form', { title: 'Create new Producer' });
};

exports.producer_create_post = [
  validator.body('company', 'Company name is necessary').trim().isLength({ min: 1 }),
  validator.body('established', 'I assume no game developer company was established before 1850. I know, wild, but enter a year between 1850 and 2099').optional({ checkFalsy: true }).isInt({ min: 1850, max: 2099 }),

  validator.sanitizeBody('company').escape(),
  validator.sanitizeBody('established').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    let producer = new Producer({
      company: req.body.company,
      established: req.body.established,
    });

    if (!errors.isEmpty()) {
      res.render('producer_form', { title: 'Create new Producer', producer: req.body, errors: errors.array() });
      return;
    } else {
      Producer.findOne({ 'company': req.body.company })
      .exec(function (err, foundProducer) {
        if (err) {
          return next(err);
        }

        if (foundProducer) {
          res.redirect(foundProducer.url);
        } else {
          producer.save(function (err) {
            if (err) {
              return next(err);
            }

            res.redirect(producer.url);
          });
        }
      });
    }
  },
];

exports.producer_delete_get = function (req, res, next) {
  async.parallel({
    producer: function (callback) {
      Producer.findById(req.params.id)
      .exec(callback);
    },

    gamesByProducer: function (callback) {
      Game.find({ 'producer': req.params.id })
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

    if (results.producer === null) {
      console.log('it is not longer there, dummy');
      res.redirect('/producers');
    }

    res.render('producer_delete', { title: 'Delete Producer', producer: results.producer, gamesByProducer: results.gamesByProducer, referrer: results.referrer });
  });
};

exports.producer_delete_post = function (req, res, next) {
  async.parallel({
    producer: function (callback) {
      Producer.findById(req.body.idToDelete)
      .exec(callback);
    },

    gamesByProducer: function (callback) {
      Game.find({ 'producer': req.body.idToDelete })
      .exec(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    if (results.gamesByProducer.length > 0) {
      res.render('producer_delete', { title: 'Delete Producer', producer: results.producer, gamesByProducer: results.gamesByProducer });
      return;
    } else {
      console.log('idtodelete: ', req.body.idToDelete);
      Producer.findByIdAndRemove(req.body.idToDelete, function deleteProducer(err) {
        if (err) {
          return next(err);
        }

        res.redirect('/producers');
      });
    }
  });
};

exports.producer_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Producer update GET');
};

exports.producer_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Producer update POST');
};

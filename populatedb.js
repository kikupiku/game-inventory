#! /usr/bin/env node

console.log('This script populates some test games, platforms, genres, producers, and reviews to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Game = require('./models/game');
var Genre = require('./models/genre');
var Platform = require('./models/platform');
var Producer = require('./models/producer');
var Review = require('./models/review');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var games = []
var genres = []
var platforms = []
var producers = []
var reviews = []

function producerCreate(company, established, cb) {
  producerdetail = { company: company };
  if (established != false) producerdetail.established = established;

  var producer = new Producer(producerdetail);

  producer.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }

    console.log('New Producer: ' + producer);
    producers.push(producer);
    cb(null, producer);
  });
}

function genreCreate(name, cb) {
  var genre = new Genre({ label: name });

  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }

    console.log('New Genre: ' + genre);
    genres.push(genre);
    cb(null, genre);
  });
}

function platformCreate(name, detail, cb) {
  var platform = new Platform(
    {
      name: name,
      detail: detail,
    }
  );

  platform.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }

    console.log('New Platform: ' + platform);
    platforms.push(platform);
    cb(null, platform);
  });
}

function gameCreate(title, producer, summary, platform, premiere, genre, picture, isOnWishlist, cb) {
  gamedetail = {
    title: title,
    producer: producer,
    platform: platform,
    isOnWishlist: isOnWishlist,
  };

  if (summary != false) gamedetail.summary = summary;
  if (premiere != false) gamedetail.premiere = premiere;
  if (genre != false) gamedetail.genre = genre;
  if (picture != false) gamedetail.picture = picture;

  var game = new Game(gamedetail);
  game.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }

    console.log('New Game: ' + game);
    games.push(game);
    cb(null, game);
  });
}


function reviewCreate(game, sourcePage, content, rating, link, cb) {
  reviewdetail = {
    game: game,
    rating: rating,
  };

  if (sourcePage != false) reviewdetail.sourcePage = sourcePage;
  if (content != false) reviewdetail.content = content;
  if (link != false) reviewdetail.link = link;

  var review = new Review(reviewdetail);
  review.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Review: ' + review);
      cb(err, null);
      return;
    }

    console.log('New Review: ' + review);
    reviews.push(review);
    cb(null, review);
  });
}


function createProducersGenresAndPlatforms(cb) {
    async.series([
        function (callback) {
          producerCreate('CD Project Red', 1994, callback);
        },
        function (callback) {
          producerCreate('Bethesda Softworks LLC', 1986, callback);
        },
        function (callback) {
          producerCreate('Electronic Arts Inc.', 1982, callback);
        },
        function(callback) {
          producerCreate('Blizzard Entertainment Inc.', 1991, callback);
        },
        function(callback) {
          producerCreate('BioWare', 1995, callback);
        },
        function(callback) {
          producerCreate('Nintendo', 1889, callback);
        },
        function(callback) {
          producerCreate('SquareSoft', 1986, callback);
        },
        function(callback) {
          genreCreate('Platformer', callback);
        },
        function(callback) {
          genreCreate('Action-adventure', callback);
        },
        function(callback) {
          genreCreate('Shooter', callback);
        },
        function(callback) {
          genreCreate('RPG', callback);
        },
        function(callback) {
          genreCreate('JRPG', callback);
        },
        function (callback) {
          platformCreate('Computer', 'Microsoft Windows', callback);
        },
        function (callback) {
          platformCreate('Console', 'Nintendo Switch', callback);
        },
        function (callback) {
          platformCreate('Console', 'PlayStation4', callback);
        },
        function(callback) {
          platformCreate('Arcade', 'coin-op machine', callback);
        },
        ],
        // optional callback
        cb);
}


function createGames(cb) {
  async.parallel([
    function (callback) {
      gameCreate('Baldur\'s Gate', producers[4], 'It is the first game in the Baldur\'s Gate series, and is set in the Sword Coast region of Faerûn. The plot of Baldur\'s Gate revolves around the main character, Gorion\'s Ward, and deals with the politics of the city of Baldur\'s Gate, as well as the aftermath of the Time of Troubles.', [platforms[0], platforms[2],], 1998, [genres[3],], false, 'Already played', callback);
    },
    function (callback) {
      gameCreate('The Legend of Zelda: Breath of the Wild', producers[5], 'Breath of the Wild takes place at the end of the Zelda timeline in the kingdom of Hyrule. 10,000 years before the beginning of the game, the evil Calamity Ganon threatens Hyrule, but he is defeated by a princess with the blood of the goddess and with the help of her appointed knight.', [platforms[1],], 2017, [genres[1],], false, 'Already played', callback);
    },
    function (callback) {
      gameCreate('Final Fantasy VIII', producers[6], 'Somewhere in the odd, anachronistic past-future of… unnamed planet, Headmaster Cid, who looks uncannily like Robin Williams, trains groups of teenagers at Hogwarts school of Mercenaries, AKA Balamb Garden. They have dances and school events and band practice and go on military deployments.', [platforms[0], platforms[1], platforms[2],], 2017, [genres[4],], false, 'Wanted', callback);
    },
  ],
    // optional callback
    cb);
}


function createReviews(cb) {
  async.parallel([
    function(callback) {
      reviewCreate(games[1], 'GameSpot', 'From its mysterious opening to its action-packed conclusion, The Legend of Zelda: Breath of the Wild is a revolution for Nintendo\'s revered series. It\'s both a return to form and a leap into uncharted territory, and it exceeds expectations on both fronts. The game takes designs and mechanics perfected in other games and reworks them for its own purposes to create something wholly new, but also something that still feels quintessentially like a Zelda game. It\'s a truly magical work of art that embodies Nintendo\'s unique talents, and a game that everyone should play regardless of their affinity for the series\' past.', '10/10', 'https://www.gamespot.com/reviews/the-legend-of-zelda-breath-of-the-wild-review/1900-6416626/', callback)
    },
    function(callback) {
      reviewCreate(games[1], 'The Verge', 'Link\’s latest adventure is a bold and much-needed reinvention of the beloved franchise', '-', 'https://www.theverge.com/2017/3/2/14787082/the-legend-of-zelda-breath-of-the-wild-review', callback)
    },
    function(callback) {
      reviewCreate(games[1], 'Time', 'The Legend of Zelda: Breath of The Wild Is a Masterpiece', '5/5', 'https://time.com/4683122/zelda-breath-of-the-wild-review/', callback)
    },
    function(callback) {
      reviewCreate(games[0], 'RPG Site', 'Going through Baldur\'s Gate for the first time is a reminder of what makes a classic RPG -- It\’s hard to miss the ways it influenced the genre two decades years ago and how its impact can still be seen in games today, but as a modern experience, it does require a new player to meet in the middle a bit in terms of quality-of-life and the slightly-dated presentation. Despite that, this is the perfect game for a fan of the genre like me to finally play and having an updated version of the game available to a wide new audience is an opportunity for new fans to see exactly why it remains so highly regarded to this day.', '8/10', 'https://www.rpgsite.net/review/9073-baldur-s-gate-enhanced-edition-review', callback)
    },

  ],
  // Optional callback
  cb);
}



async.series([
  createProducersGenresAndPlatforms,
  createGames,
  createReviews
],
// Optional callback
function(err, results) {
  if (err) {
    console.log('FINAL ERR: '+err);
  }
  else {
    console.log('REVIEWS: ' + reviews);

  }
  // All done, disconnect from database
  mongoose.connection.close();
});

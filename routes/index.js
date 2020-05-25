var express = require('express');
var router = express.Router();

let gameController = require('../controllers/gameController');
let genreController = require('../controllers/genreController');
let platformController = require('../controllers/platformController');
let producerController = require('../controllers/producerController');
let reviewController = require('../controllers/reviewController');

/* GET home page. */
router.get('/', gameController.index);

/// GAME ROUTES ///

router.get('/games', gameController.game_list);
router.get('/game/:id', gameController.game_detail);
router.get('/wishlist', gameController.game_wishlist);
router.get('/game/create', gameController.game_create_get);
router.post('/game/create', gameController.game_create_post);
router.get('/game/:id/delete', gameController.game_delete_get);
router.post('/game/:id/delete', gameController.game_delete_post);
router.get('post/game/:id/update', gameController.game_update_get);
router.post('/game/:id/update', gameController.game_update_post);

/// GENRE ROUTES ///

router.get('/genres', genreController.genre_list);
router.get('/genre/:id', genreController.genre_detail);
router.get('/genre/create', genreController.genre_create_get);
router.post('/genre/create', genreController.genre_create_post);
router.get('/genre/:id/delete', genreController.genre_delete_get);
router.post('/genre/:id/delete', genreController.genre_delete_post);
router.get('/genre/:id/update', genreController.genre_update_get);
router.post('/genre/:id/update', genreController.genre_update_post);

///PLATFORM ROUTES ///

router.get('/platforms', platformController.platform_list);
router.get('/platform/:id', platformController.platform_detail);
router.get('/platform/create', platformController.platform_create_get);
router.post('/platform/create', platformController.platform_create_post);
router.get('/platform/:id/delete', platformController.platform_delete_get);
router.post('/platform/:id/delete', platformController.platform_delete_post);
router.get('/platform/:id/update', platformController.platform_update_get);
router.post('/platform/:id/update', platformController.platform_update_post);

/// PRODUCER ROUTES ///

router.get('/producers', producerController.producer_list);
router.get('/producer/:id', producerController.producer_detail);
router.get('/producer/create', producerController.producer_create_get);
router.post('/producer/create', producerController.producer_create_post);
router.get('/producer/:id/delete', producerController.producer_delete_get);
router.post('/producer/:id/delete', producerController.producer_delete_post);
router.get('/producer/:id/update', producerController.producer_update_get);
router.post('/producer/:id/update', producerController.producer_update_post);

/// REVIEW ROUTES ///

router.get('/reviews', reviewController.review_list);
router.get('/review/:id', reviewController.review_detail);
router.get('/review/create', reviewController.review_create_get);
router.post('/review/create', reviewController.review_create_post);
router.get('/review/:id/delete', reviewController.review_delete_get);
router.post('/review/:id/delete', reviewController.review_delete_post);
router.get('/review/:id/update', reviewController.review_update_get);
router.post('/review/:id/update', reviewController.review_update_post);

module.exports = router;

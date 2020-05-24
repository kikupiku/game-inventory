let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let GameSchema = new Schema(
  {
    title: { type: String, required: true, max: 50 },
    producer: { type: Schema.Types.ObjectId, ref: 'Producer', required: true },
    summary: { type: String, required: true },
    platform: { type: Schema.Types.ObjectId, ref: 'Platform', required: true },
    premiere: { type: Number, min: [1958, 'Really? Earlier than Tennis for Two?'], max: 2099, required: false },
    genre: { type: Schema.Types.ObjectId, ref: 'Genre', required: true },
    picture: { type: String, required: false },
    isOnWishlist: { type: Boolean, required: false },
  }
);

GameSchema
.virtual('url')
.get(function () {
  return '/game/' + this._id;
});

module.exports = mongoose.model('Game', GameSchema);

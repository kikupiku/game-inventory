let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ReviewSchema = new Schema(
  {
    game: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    sourcePage: { type: String, required: true },
    content: { type: String, required: false },
    rating: { type: String, required: true },
    link: { type: String, required: false },
  }
);

ReviewSchema
.virtual('url')
.get(function () {
  return '/review/' + this._id;
});

module.exports = mongoose.model('Review', ReviewSchema);

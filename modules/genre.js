let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let GenreSchema = new Schema(
  {
    label: { type: String, required: true },
  }
);

GenreSchema
.virtual('url')
.get(function () {
  return '/genre/' + this._id;
});

module.exports = mongoose.model('Genre', GenreSchema);

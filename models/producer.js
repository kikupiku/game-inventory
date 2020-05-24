let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ProducerSchema = new Schema(
  {
    company: { type: String, required: true },
    established: { type: Number, required: false, min: 1850, max: 2099 },
  }
)

ProducerSchema
.virtual('url')
.get(function () {
  return '/producer/' + this._id;
});

module.exports = mongoose.model('Producer', ProducerSchema);

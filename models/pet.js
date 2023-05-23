const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const petSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  adoptionStatus: { type: String, required: true },
  picture: { type: String, required: true },
  age: { type: Number, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  bio: { type: String, required: true },
  hypoallergenic: { type: Boolean, required: true },
  dietaryRestrictions: { type: String, required: true },
  breed: { type: String, required: true },
  wishlist: [{ type: String }],
  fosterUser: { type: String },
  adopterUser: { type: String },
});

petSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Pet", petSchema);

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", required: true },
  image: { type: String, required: false },  // You can store the image URL or path here
  source: { type: String, required: true } // Allow any value for source
});

module.exports = mongoose.model("Product", productSchema);

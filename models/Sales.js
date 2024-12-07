const mongoose = require("mongoose");

const salesReportSchema = new mongoose.Schema({
  customer: { 
    type: String, 
    ref: "Customer", 
    required: true 
  },  // Reference to Customer

  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },  // Reference to Product

  quantity: { 
    type: Number, 
    required: true 
  },  // Quantity of the product sold

  date: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },  // Date of the sale
});

module.exports = mongoose.model("SalesReport", salesReportSchema);

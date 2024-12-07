const express = require("express");
const router = express.Router();
const SalesReport = require("../models/Sales"); // Import the SalesReport model
const Product = require("../models/Product");

// Create a new sales report
router.post("/", async (req, res) => {
  const { customer, product, quantity, date } = req.body;

  try {
    // Step 1: Find the product based on product ID
    const productRecord = await Product.findById(product);
    console.log(productRecord)
    if (!productRecord) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Step 2: Check if enough stock is available
    if (productRecord.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Step 3: Create the sales report
    const newSale = new SalesReport({
      customer,
      product,
      quantity,
      date,
    });

    // Step 4: Save the sales report
    await newSale.save();

    // Step 5: Update the product stock by reducing the sold quantity
    productRecord.quantity -= quantity;

    // Step 6: Save the updated product, preserving other fields like `source`
    await productRecord.save();

    // Step 7: Send response back
    res.status(201).json({ message: "Sale recorded and stock updated", sale: newSale });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all sales reports
router.get('/', async (req, res) => {
  try {
    const salesReports = await SalesReport.find()
      .populate("product")  // Populate product details
      .exec();

    res.status(200).json(salesReports); // Return all sales reports
  } catch (err) {
    console.error("Error fetching sales reports:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get sales reports for a specific customer name
router.get('/customer', async (req, res) => {
  const { customerName } = req.query; // Expecting customerName as a query parameter

  try {
    const salesReports = await SalesReport.find({ customer: { $regex: customerName, $options: 'i' } })
      .populate("product")  // Populate product details
      .exec();

    if (salesReports.length === 0) {
      return res.status(404).json({ message: "No sales reports found for this customer" });
    }

    res.status(200).json(salesReports); // Return sales reports for the customer
  } catch (err) {
    console.error("Error fetching sales reports by customer name:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get sales reports for a specific product
router.get('/product/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const salesReports = await SalesReport.find({ product: productId })
      .populate("customer") // Populate customer details
      .exec();

    res.status(200).json(salesReports); // Return sales reports for the product
  } catch (err) {
    console.error("Error fetching sales reports for product:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get sales reports within a date range
router.get('/date', async (req, res) => {
  const { startDate, endDate } = req.query; // Expecting startDate and endDate as query parameters

  try {
    const salesReports = await SalesReport.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .populate("customer") // Populate customer details
      .populate("product")  // Populate product details
      .exec();

    res.status(200).json(salesReports); // Return sales reports within the date range
  } catch (err) {
    console.error("Error fetching sales reports by date range:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update an existing sales report
router.put('/:saleId', async (req, res) => {
  const { saleId } = req.params; // Extract sale ID from URL parameters
  const { customer, product, quantity, date } = req.body;

  try {
    // Find and update the sales report
    const updatedSale = await SalesReport.findByIdAndUpdate(
      saleId,
      { customer, product, quantity, date },
      { new: true } // Return the updated document
    ).populate("customer").populate("product"); // Populate customer and product details

    if (!updatedSale) {
      return res.status(404).json({ message: "Sales report not found" });
    }

    res.status(200).json(updatedSale); // Return the updated sales report
  } catch (err) {
    console.error("Error updating sales report:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a sales report
router.delete('/:saleId', async (req, res) => {
  const { saleId } = req.params; // Extract sale ID from URL parameters

  try {
    const deletedSale = await SalesReport.findByIdAndDelete(saleId);

    if (!deletedSale) {
      return res.status(404).json({ message: "Sales report not found" });
    }

    res.status(200).json({ message: "Sales report deleted successfully" }); // Return success message
  } catch (err) {
    console.error("Error deleting sales report:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
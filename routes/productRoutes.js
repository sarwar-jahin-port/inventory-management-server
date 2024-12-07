const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const Sales = require("../models/Sales");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Rename file to avoid conflicts
  },
});
const upload = multer({ storage });

// Create a new product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Extract file data if provided
    const imagePath = req.file ? req.file.path : null;

    // Create a new product instance with both body data and the file path
    const productData = {
      ...req.body, // Spread other fields like name, quantity, source, folder
      image: imagePath, // Add the uploaded file path
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("folder");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("folder");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products by folder ID
router.get("/folder/:folderId", async (req, res) => {
  try {
    // Find products where the `folder` matches the folder ID from the request
    const products = await Product.find({ folder: req.params.folderId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stock update
router.put("/:id/addStock", async (req, res) => {
  try {
    const { addedQuantity } = req.body;
    // Validate that the quantity is provided and is a number
    if (!addedQuantity || isNaN(addedQuantity)) {
      return res.status(400).json({ error: "Invalid quantity provided." });
    }

    // Find the product and increment the stock
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    product.quantity += Number(addedQuantity); // Increment stock

    await product.save(); // Save updated product
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales update
router.put("/:id/subtractStock", async (req, res) => {
  try {
    const { quantitySold, customerName } = req.body;

    // Validate input data
    if (!quantitySold || quantitySold <= 0 || !customerName) {
      return res.status(400).json({ error: "Invalid input data. Please provide quantity and customer name." });
    }

    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Check if there's enough stock to subtract
    if (product.quantity < quantitySold) {
      return res.status(400).json({ error: "Not enough stock to subtract." });
    }

    // Subtract the quantity from the product's stock
    product.quantity -= quantitySold;
    await product.save();

    // Create a new sales record
    const newSale = new Sales({
      customer: customerName,  // This assumes customer is a string. If it's a reference, you need to provide the customer ID
      product: product._id,
      quantity: quantitySold,
    });

    await newSale.save();

    // Return the updated product and the new sales record
    res.json({
      message: "Stock updated and sales record created successfully.",
      updatedProduct: product,
      newSale: newSale
    });

  } catch (err) {
    console.error("Error during stock update and sales record creation:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
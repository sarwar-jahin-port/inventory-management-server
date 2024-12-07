const express = require("express");
const Product = require("../models/Product");
const Sales = require("../models/Sales");
const router = express.Router();
const cloudinary = require('../config/cloudinaryConfig');
const upload = require('../config/uploadConfig')

// Create a new product route
// Use async for functions where you need to use 'await'
router.post("/", upload, async (req, res) => {
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: 'auto' }, // Automatically detect file type
        (error, cloudinaryResponse) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          // Once uploaded, save the Cloudinary image URL to the database
          const productData = {
            name: req.body.name,
            quantity: req.body.quantity,
            source: req.body.source,
            folder: req.body.folder,
            image: cloudinaryResponse.secure_url, // Save the Cloudinary image URL
          };

          // Create and save the product with the Cloudinary URL
          const product = new Product(productData);
          product.save()
            .then(() => res.status(201).json(product)) // Send a response after saving
            .catch(err => res.status(500).json({ error: err.message }));
        }
      );

      // Send the image buffer to Cloudinary
      result.end(req.file.buffer); // Using the file buffer from memory
    } catch (err) {
      console.error("Error uploading image to Cloudinary:", err.message);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(400).json({ error: "No file uploaded" });
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
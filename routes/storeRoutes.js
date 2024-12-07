const express = require("express");
const Store = require("../models/Store");
const router = express.Router();
const Folder = require("../models/Folder");
const Product = require("../models/Product");

// Create a new store
router.post("/", async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all stores
router.get("/", async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single store by ID
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get folders by store ID
router.get("/folders/:storeId", async (req, res) => {
  console.log("folders/storeid")
  try {
    // Find folders where the `store` matches the store ID from the request
    const folders = await Folder.find({ store: req.params.storeId });

    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a store
router.put("/:id", async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a store and its associated folders and products
router.delete("/:id", async (req, res) => {
  try {
    // Delete all folders associated with the store
    const folders = await Folder.find({ store: req.params.id });
    
    // Delete products for each folder
    await Product.deleteMany({ folder: { $in: folders.map(f => f._id) } });
    
    // Delete all folders
    await Folder.deleteMany({ store: req.params.id });
    
    // Delete the store itself
    const store = await Store.findByIdAndDelete(req.params.id);
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ message: "Store, folders, and products deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

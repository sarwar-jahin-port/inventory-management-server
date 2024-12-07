const express = require("express");
const Folder = require("../models/Folder");
const Product = require("../models/Product");
const router = express.Router();

// Create a new folder
router.post("/", async (req, res) => {
  try {
    const folder = new Folder(req.body);
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all folders
router.get("/", async (req, res) => {
  try {
    const folders = await Folder.find().populate("store");
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single folder by ID
router.get("/:id", async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id).populate("store");
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a folder
router.put("/:id", async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a folder and its associated products
router.delete("/:id", async (req, res) => {
  try {
    // First, delete all products associated with the folder
    await Product.deleteMany({ folder: req.params.id });

    // Then, delete the folder
    const folder = await Folder.findByIdAndDelete(req.params.id);
    
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.json({ message: "Folder and its products deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

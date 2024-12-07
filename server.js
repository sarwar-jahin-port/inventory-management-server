const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const storeRoutes = require("./routes/storeRoutes");
const folderRoutes = require("./routes/folderRoutes");
const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes")

const app = express();
app.use(bodyParser.json());
app.use(cors(
  {
    origin: ["https://inventory-management-client-pink.vercel.app"],
    methods: ["POST", "GET"],
    credentials: true
  }
));

app.use("/api/stores", storeRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) =>{
  res.send("Inventory management is running");
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

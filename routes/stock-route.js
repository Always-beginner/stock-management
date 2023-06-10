const express = require("express");
const router = express.Router();
const stocksController = require("../controller/stock-controller");

router.get("/", stocksController.getAllStocks);
router.get("/:id", stocksController.getStockById);
router.patch("/:id", stocksController.updateStock);
module.exports = router;

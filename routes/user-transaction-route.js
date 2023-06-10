const express = require("express");
const router = express.Router();
const userTransactionController = require("../controller/user-transaction-controller");

router.get("/:id", userTransactionController.getTransactionById);
router.get("/", userTransactionController.getAllTransaction);
router.post("/buy", userTransactionController.buyTransaction);
router.post("/sell", userTransactionController.sellTransaction);
module.exports = router;

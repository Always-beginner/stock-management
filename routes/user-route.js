const express = require("express");
const router = express.Router();
const userController = require("../controller/user-controller");

router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
module.exports = router;

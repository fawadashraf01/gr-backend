const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(productController.getAllProduct);

router
  .route("/:id")
  .get(productController.getProduct)
  .delete(productController.deleteProduct);

module.exports = router;

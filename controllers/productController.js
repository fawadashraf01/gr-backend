const Product = require("../models/productModel");
const stripeController = require("./stripeController");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return new AppError("No document found with the given id");

  const isDeleted = await stripeController.deleteProduct(
    product.stripeProductId,
    product.stripePriceId
  );

  if (isDeleted) {
    const doc = await Product.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
});

exports.getProduct = factory.getOne(Product);
exports.getAllProduct = factory.getAll(Product);

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.messageUsed = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });

  if (!user) {
    return next(new AppError("No user found with that Email", 404));
  }

  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    {
      messagesLimit: user.messagesLimit - 1,
      messagesUsage: user.messagesUsage + 1,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  console.log(updatedUser);

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

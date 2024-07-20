const User = require("../models/userModel");

const unique = require ("uniqid");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const mongoDbValidation = require("../utils/mongoDbValidation");
const { generateRefreshToken } = require("../config/refreschToken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// const { response } = require("express");
const sendEmail = require("./emailController.js");

//create a user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User already exists");
  }
});

const LoginUserController = asyncHandler(async (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body

  // Basic validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // Check if email is valid
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  // Check if user with the provided email exists
  const findUser = await User.findOne({ email });

  // If user exists and password matches
  if (findUser && (await findUser.isPasswordMatched(password))) {
    // Generate refresh token for the user
    const refreshToken = await generateRefreshToken(findUser._id);

    // Update user's refresh token in the database
    const updateUser = await User.findByIdAndUpdate(
      findUser._id,
      { refreshToken },
      { new: true }
    );

    // Set refresh token in the cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // Set cookie expiration time
    });

    // Send user information and access token in the response
    res.json({
      _id: findUser._id,
      name: findUser.name,
      lastName: findUser.lastName,
      email: findUser.email,
      mobile: findUser.mobile,
      token: generateToken(findUser._id), // Generate and send access token
    });
  } else {
    // If user does not exist or password does not match, throw error
    res.status(401);
    throw new Error("Invalid credentials");
  }
});
// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      name: findAdmin?.name,
      lastName: findAdmin?.lastName,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// get a single user
const getSingUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);

  try {
    const getSingUser = await User.findById(id);
    res.json(getSingUser);
  } catch (error) {
    throw new Error(error);
  }
});


// delete a single user
const deleteSingUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);

  try {
    const deleteSingUser = await User.findByIdAndDelete(id);
    res.json({ deleteSingUser });
  } catch (error) {
    throw new Error(error);
  }
});

//handle refresh token
const HandelRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No Refresh Token in user");
  if (!user) throw new Error("No Refresh Token for this user");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("something is wrong with your token");
    }
    const accessToken = generateToken(user?.id);
    res.json(accessToken);
  });
});

//Logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});

// update a single user
const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  mongoDbValidation(id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);

  try {
    const block = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.json({
      message: "User blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  mongoDbValidation(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.json({
      message: "User unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});
// save user Address

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

//update password
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user; // Extract user ID from request user object
  const { password } = req.body; // Extract password from request body

  // Validate if _id is provided and exists
  mongoDbValidation(_id);

  try {
    // Update the user's password only if password is provided
    if (password) {
      // Find the user by ID
      const user = await User.findById(_id);

      // Set the new password
      user.password = password; // Ensure that password is a string

      // Save the updated user object
      const updatedUser = await user.save();

      // Send the updated user object as a response
      return res.json(updatedUser);
    } else {
      // If password is not provided, send an error response
      return res.status(400).json({ message: "Password is required" });
    }
  } catch (error) {
    // Handle any errors that occur during password update
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

// const updatePassword = asyncHandler(async (req, res) => {
//   const { _id } = req.user;
//   const password = req.body;
//   mongoDbValidation(_id);
//   const user = await User.findById(_id);
//   if (password) {
//     user.password = password;
//     const updatedPassword = await user.save();
//     res.json(updatedPassword);
//   } else {
//     res.json(user);
//   }
// });

//forgot password
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  try {
    const token = await user.createPasswordResetToken(); // Call createPasswordToken on the user object
    await user.save();
    const resetURL = `Hallo, please click this link in order to reset your password, and its valid 10min from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>click Here</a>`;
    const data = {
      to: email,
      text: "Hallo User",
      subject: "forgot password link",
      htm: resetURL,
    };
    // Assuming sendEmail is defined elsewhere
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error); // Just throw the error without wrapping it
  }
});

// reset password

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("User not found");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});
const updateProfilePicture = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { profilePicture } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      _id,
      { profilePicture },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to update dashboard settings
const updateDashboardSettings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { themeColor } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      _id,
      { "dashboardSettings.themeColor": themeColor },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
  createUser,
  LoginUserController,
  getAllUsers,
  getSingUser,
  deleteSingUser,
  updatedUser,
  blockUser,
  unblockUser,
  HandelRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  saveAddress,
  loginAdmin,
  updateDashboardSettings,
  updateProfilePicture


};

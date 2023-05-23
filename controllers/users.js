require("dotenv").config();
const usersRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "users",
  },
});

const upload = multer({ storage: storage });

const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.json({
      message: "No token provided",
      isLoggedIn: false,
    });
  }

  const decoded = jwt.verify(token, process.env.SECRET);
  req.user = decoded;
  next();
};

//Signup
usersRouter.post("/", async (request, response) => {
  try {
    const userObject = request.body;
    const saltRounds = 10;
    const password = userObject.password;
    const email = userObject.email;

    const existingUser = await User.find({ email: email });
    if (existingUser.length > 0) {
      return response.status(400).json({ error: "Email already exists." });
    }

    bcrypt.hash(password, saltRounds, async (error, hash) => {
      const user = new User({
        firstName: userObject.firstName,
        lastName: userObject.lastName,
        password: hash,
        confirmPassword: hash,
        email: userObject.email,
        phoneNumber: userObject.phoneNumber,
      });
      const savedUser = await user.save();
      response.status(201).json(savedUser);
    });
  } catch (error) {
    console.log(error);
    response.status(500).json(error);
  }
});

//Login
usersRouter.post("/login", verifyJWT, async (req, res) => {
  const userLoggedIn = req.body;
  try {
    const dbUserArray = await User.find({ email: userLoggedIn.email });
    const dbUser = dbUserArray[0];
    if (!dbUser) {
      return res.json({
        message: "Invalid username or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      userLoggedIn.password,
      dbUser.password
    );

    if (isPasswordCorrect) {
      const payload = {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.firstName,
      };

      const token = await jwt.sign(payload, process.env.SECRET, {
        expiresIn: "30d",
      });

      console.log("token", token);

      res.json({
        message: "Success",
        token: token,
        payload: payload,
        isLoggedIn: true,
      });
    } else {
      return res.json({
        message: "Invalid username or password",
      });
    }
  } catch (err) {
    return res.json({ message: "Error signing token" });
  }
});

// get the token, verify it, and then return the user

usersRouter.get("/loggeduser", verifyJWT, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.json({
      message: "User not found",
      isLoggedIn: false,
    });
  }

  return res.json({
    message: "Success",
    isLoggedIn: true,
    user: user,
  });
});

usersRouter.put(
  "/updateprofile",
  verifyJWT,
  upload.single("profilePicture"),
  async (req, res) => {
    const path = req.file.path;
    const userData = req.body;
    const id = req.user.id;

    const filter = { _id: id };
    const update = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      profilePicture: path,
    };

    const updatedUser = await User.findOneAndUpdate(filter, update, {
      new: true,
    });
    console.log(updatedUser);
  }
);

module.exports = usersRouter;

const petsRouter = require("express").Router();
const { verify } = require("jsonwebtoken");
const Pet = require("../models/pet");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const jwt = require("jsonwebtoken");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pets",
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

// ("localhost:3002/api/pets");

petsRouter.get("/pets", async (request, response) => {
  const pets = await Pet.find({});
  response.status(200).json(pets);
});

petsRouter.get("/:petId", async (request, response) => {
  const { petId } = request.params;
  const pets = await Pet.find({
    _id: petId,
  });

  response.status(200).json(pets);
});

petsRouter.post("/filter/", async (request, response) => {
  const filter = request.body;
  Object.keys(filter).forEach((key) => {
    if (filter[key] === "") {
      delete filter[key];
    }
  });
  const filteredPets = await Pet.find(filter);
  response.json(filteredPets);
});

petsRouter.patch("/addtowishlist/", async (request, response) => {
  const { petID, userID } = request.body;
  const pet = await Pet.findById(petID);
  const wishlist = pet.wishlist;

  if (!wishlist.includes(userID)) {
    wishlist.push(userID);
    await pet.save();
  } else {
    console.log("UserID already exists in the wishlist!");
  }
});

petsRouter.patch("/deletewishlist/", async (request, response) => {
  const { petID, userID } = request.body;
  const pet = await Pet.findById(petID);
  const wishlist = pet.wishlist;
  wishlist.pull(userID);
  await pet.save();
  response.json(wishlist);
});

petsRouter.patch("/addtofoster/", async (request, response) => {
  const { petID, userID } = request.body;
  const pet = await Pet.findById(petID);
  const fosterUser = userID;
  pet.fosterUser = fosterUser;

  if (fosterUser === "") {
    return response.status(400).json({
      error:
        "This pet is already at someone's home. We will let you know if it is available again.",
    });
  }

  await pet.save();
  response.json(fosterUser);
});

petsRouter.patch("/deletefoster/", async (request, response) => {
  const { petID } = request.body;
  const pet = await Pet.findById(petID);
  const fosterUser = "";
  pet.fosterUser = fosterUser;
  await pet.save();
  response.json(fosterUser);
});

petsRouter.patch("/adoptpet/", async (request, response) => {
  const { petID, userID } = request.body;
  const pet = await Pet.findById(petID);
  const adopterUser = userID;
  pet.adopterUser = adopterUser;
  const fosterUser = "";
  pet.fosterUser = fosterUser;
  await pet.save();
  response.json(adopterUser);
});

petsRouter.patch("/returnpet/", async (request, response) => {
  const { petID } = request.body;
  const pet = await Pet.findById(petID);
  const adopterUser = "";
  pet.adopterUser = adopterUser;
  await pet.save();
  response.json(adopterUser);
});

petsRouter.post(
  "/addpet",
  verifyJWT,
  upload.single("picture"),
  async (request, response) => {
    const petObject = request.body;

    const newPet = new Pet({
      name: petObject.name,
      type: petObject.type,
      adoptionStatus: petObject.adoptionStatus,
      breed: petObject.breed,
      size: petObject.size,
      age: petObject.age,
      description: petObject.description,
      dietaryRestrictions: petObject.dietaryRestrictions,
      hypoallergenic: petObject.hypoallergenic,
      bio: petObject.bio,
      color: petObject.color,
      picture: request.file ? request.file.path : undefined,
    });

    const savedPet = await newPet.save();
    response.status(201).json(savedPet);
  }
);

petsRouter.put(
  "/editpet",
  verifyJWT,
  upload.single("picture"),
  async (request, response) => {
    const petId = request.body._id;
    const petObject = request.body;
    const filter = { _id: petId };

    const update = {
      name: petObject.name,
      type: petObject.type,
      adoptionStatus: petObject.adoptionStatus,
      breed: petObject.breed,
      size: petObject.size,
      age: petObject.age,
      description: petObject.description,
      dietaryRestrictions: petObject.dietaryRestrictions,
      hypoallergenic: petObject.hypoallergenic,
      bio: petObject.bio,
      color: petObject.color,

      picture: request.file ? request.file.path : undefined,
    };

    const updatedPet = await Pet.findOneAndUpdate(filter, update, {
      new: true,
    });
    response.json(updatedPet);
  }
);

module.exports = petsRouter;

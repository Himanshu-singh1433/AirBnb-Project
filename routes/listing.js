if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}


const express = require("express");
const router = express.Router();
const wrapAsync = require("../utility/wrapAsync.js");
const ExpressError = require("../utility/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);  // result se error destructure karo
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Restructering app.js

//Index Route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    wrapAsync(listingController.createListing),
    validateListing,
  );
//   .post(upload.single("listing[image]"), (req, res) => {
//   console.log(req.file); // Cloudinary URL
//   res.send(req.file);
// });



//new  route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show Route
router.get(
  "/:id",
  wrapAsync(listingController.showListing)
);

//create Route



//Edit Route
router.get(
  "/:id/edit",
   isLoggedIn,
    isOwner,
  wrapAsync(listingController.renderEditForm)
);

//Update Route
router.put(
  "/:id", isLoggedIn, isOwner,
  upload.single('listing[image]'),
  wrapAsync(listingController.updateListing)
);

//Delete Route
router.delete(
  "/:id", isLoggedIn, isOwner,
  wrapAsync(listingController.deleteListing)
);

module.exports = router;
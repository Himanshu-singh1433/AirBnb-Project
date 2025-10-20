const express = require("express");
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utility/wrapAsync.js");
const ExpressError = require("../utility/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const{isLoggedIn,isReviewAuther}=require("../middleware.js");

const reviewController = require("../controllers/review.js");



//Review for Server side validation!
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);  // result se error destructure karo
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


//Reviews-Post route
router.post("/", 
  isLoggedIn,
  validateReview,
    wrapAsync(reviewController.createReview)
);

// Delete reviews route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuther,
  wrapAsync(reviewController.deleteReview)
);
module.exports=router;
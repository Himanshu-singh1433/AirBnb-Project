//Require express
const express = require("express");
const app = express();
//Require mongoose
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utility/wrapAsync.js");
const ExpressError = require("./utility/ExpressError.js");
const { listingSchema } = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connect to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}
//Require to the ejs(Same the html file).
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//Creat new route
app.get("/", (req, res) => {
  res.send("Hi,I am root");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);  // result se error destructure karo
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

//new  route
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

//Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
  })
);

//create Route

app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing");
    // }

    const newListing = new Listing(req.body.listing);

    // if (! newListing.title) {
    //   throw new ExpressError(400, "Title is missing!");
    // }

    //     if (! newListing.description) {
    //   throw new ExpressError(400, "Description is missing!");
    // }

    //     if (! newListing.location) {
    //   throw new ExpressError(400, "Location is missing!");
    // }

    await newListing.save();
    console.log("Saved listing:", newListing);
    res.redirect("/listings");
  })
);

//Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
  })
);

//Update Route
app.put(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
  })
);

// app.use((req, res, next) => {
//     console.log("METHOD:", req.method); // This should show PUT after override
//     next();
// });

//Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

//middleware
app.use((err, req, res, next) => {
  // res.send("Somthing went wrong!");
  let { statusCode = 500, message = "Something went wrong!" } = err;
  //   res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { err });
});

//start to server using port number 5500
app.listen(5500, () => {
  console.log("Sever is listening to port 5500");
});
//check to server start or not=node index.js write to terminal.

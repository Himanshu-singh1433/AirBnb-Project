const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};
module.exports.renderNewForm = (req, res) => {
  console.log(req.user);

  res.render("listings/new");
}

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author"
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show", { listing });
}

module.exports.createListing = async (req, res, next) => {
  console.log(req.file);
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "..", filename);
  const newListing = new Listing(req.body.listing);
  console.log(req.user);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}

//   module.exports.createListing = async (req, res, next) => {
//   try {
//     console.log("req.file:", req.file); // check if multer sent the file

//     const newListing = new Listing(req.body.listing);

//     // Agar file upload hui hai
//     if (req.file) {
//       newListing.image = {
//         url: req.file.path,
//         filename: req.file.filename,
//       };
//     } else {
//       console.log("⚠ No file uploaded");
//     }

//     // newListing.owner = req.user._id; // if authentication added
//     await newListing.save();

//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
//   } catch (err) {
//     next(err);
//   }
// };

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","Listing you requested for does not exit!");
    req.redirect("/listing");
  }
  let origanalImageUrl = listing.image.url;
  origanalImageUrl=origanalImageUrl.replace("/upload","/upload/h_200,");

  res.render("listings/edit", { listing,origanalImageUrl });
}

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect("/listings");
}

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "New Listing Deleted!");
  res.redirect("/listings");
}
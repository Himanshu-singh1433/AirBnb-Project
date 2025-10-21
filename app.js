require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utility/ExpressError.js");
const { reviewSchema } = require("./schema.js");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connect to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));

const store =MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.KEY,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
     console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOption = {
  store,
  secret: process.env.KEY,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires:Date.now() +7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
  }
};
// app.get("/", (req, res) => {
//   res.send("Hi,I am root");
// });


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser= req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser = new User({
//     email:"stident@gmail.com",
//     username:"delta-student"
//   });
//   let registedUser = await User.register(fakeUser,"helloworld");
//   res.send(registedUser);
// })

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/",user);

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
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`✅ Server is listening on port ${port}`);
});




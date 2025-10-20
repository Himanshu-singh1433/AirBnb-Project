const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utility/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userControllers = require("../controllers/users.js");

router.get("/signup", userControllers.renderSingupForm );



router.post("/signup",userControllers.signupForm );

// GET login form
router.get("/login",userControllers.renderLoginForm );

// POST login
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userControllers.loginForm
);

router.get("/logout",userControllers.logoutFrom );

module.exports = router;
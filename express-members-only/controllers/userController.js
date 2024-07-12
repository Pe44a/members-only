const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport")
const bcrypt = require("bcryptjs")
const User = require("../models/user");
const Post = require("../models/post");


// Handle home page GET
exports.home_page_get = asyncHandler(async (req, res, next) => {
    const allPosts = await Post.find().sort({ title: 1 }).populate('author').exec();
    res.render("index", {
        isAuthenticated: req.isAuthenticated(),
        post_list: allPosts,
    });
});

// Handle user sign up on GET.
exports.user_sign_up_get = (req, res, next) => {
    res.render("sign-up-form");
  };
  
// Handle user sign up on POST.
exports.user_sign_up_post = [
    // Validate and sanitize fields.
    body("firstName")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified.")
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("lastName")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Last name must be specified.")
        .isAlphanumeric()
        .withMessage("Family name has non-alphanumeric characters."),
    body("username", "Username is too short")
        .trim()  
        .isLength({ min: 1 })
        .escape(),
    body("password", "Password must be at least 5 characters")
        .trim()  
        .isLength({ min: 5 })
        .escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render("sign-up-form", {
                errors: errors.array(),
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username
                // Don't send back password for security reasons
            });
            return;
        }
    
        // If no errors, proceed with user creation
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = new User({
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                username: req.body.username,
                password: hashedPassword,
            });
            await user.save();
            res.redirect("/");
        } catch(err) {
            return next(err);
        }
    }),
];


// Handle user sign in on GET.
exports.user_sign_in_get = (req, res, next) => {
    res.render("sign-in-form");
  };

// Handle user sign in on POST.
exports.user_sign_in_post = (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/create-post",
        failureRedirect: "/"
      })(req, res, next)
  };


// Handle user creating a post on GET.
exports.user_create_post_get = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.render('create-post-form');
      } else {
        res.redirect('/signin');
    };
}

// Handle user creating a post on POST.
exports.user_create_post_post = [
    // Ensure user is authenticated
    (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/signin');
        }
    },

    // Validate and sanitize fields.
    body("title")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Title must not be empty."),
    body("text")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Post content must not be empty."),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values
            res.render("create-post-form", {
                title: req.body.title,
                text: req.body.text,
            });
            return;
        }
    
        // If no errors, proceed with post creation
        try {
            const post = new Post({
                title: req.body.title,
                text: req.body.text,
                author: req.user._id, 
            });
            console.log(post);
            await post.save();
            res.redirect("/");
        } catch(err) {
            console.error(err);
            next(err);
        }
    }),
];
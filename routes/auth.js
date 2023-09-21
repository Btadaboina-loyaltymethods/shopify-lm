const express = require("express");
const User = require("../models/user")
// const { csrfProtection } = require("../app");
const authController = require("../controllers/auth");

const {check, body} = require('express-validator');

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);
router.post("/signup", [check('email')
                        .isEmail()
                        .withMessage('Please enter a valid')
                        .custom((value,{req} ) => {
                            // if(value === 'test@test.com') {
                            //     throw new Error('This mail is forbidden')
                            // }
                            // return true
                            
                            return User
                            .findOne({ email: value })
                            .then((userDoc) => {
                            if (userDoc) {
                                return Promise.reject('Email already exists')
                            }})
                        })
                        .normalizeEmail(),
                        body('password', 'Please enter password which contains numbers and alpha')
                        .isLength({min: 5})
                        .isAlphanumeric()
                        .trim(),
                        body('confirmPassword')
                        .trim()
                        .custom((value , {req}) => {
                            if(value !== req.body.password){
                                throw new Error('your confirm password is not matching with original password')
                            }
                            return true
                        }) 
                        ],authController.postSignup);
// router.post("/login", [check('email')
//                         .isEmail()
//                         .withMessage('Invalid email name')
//                         .body('password', 'Please enter password which contains numbers and alpha')
//                         .isLength()
//                         .isAlphanumeric()
//                     ],authController.postLogin);

router.post(
    "/login",
    [
      body('email')
        .isEmail()
        .withMessage('Invalid email address, enter proper email')
        .normalizeEmail(),
      body('password','Password must contain only letters and numbers')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
    ],
    authController.postLogin
  );
  

router.get("/reset",  authController.getReset);
router.post("/reset",  authController.postReset);

router.get("/reset/:token",  authController.getNewPassword);
router.post("/new-password", authController.postNewPassword)

router.post("/logout", authController.postLogout);

module.exports = router;

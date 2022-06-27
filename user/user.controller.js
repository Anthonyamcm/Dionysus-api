const express = require('express');
const { body } = require('express-validator')
const db = require('_helpers/db');
const userService = require('./user.service')

const router = express.Router();
const User = db.User;


router.post('/register', [
    body('first_name').trim().not().isEmpty(),
    body('last_name').trim().not().isEmpty(),
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, { req }) => {
        return User.findOne({email: value}).then(userDoc => {
            if(userDoc) {
                return Promise.reject('E-Mail is already in use.');
            }
        })
    })
    .normalizeEmail(),
    body('password').trim().isLength({min: 8})

], userService.signup)

router.post('/login', userService.login)

module.exports = router;
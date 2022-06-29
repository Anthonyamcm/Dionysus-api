const express = require('express');
const { AsyncWrapper } = require('../../Common/src/utils/error.service');
const middleware = require('../../Common/src/middleware/auth.middleware');
const userController = require('./user.controller');

const userRouter = express.Router();

userRouter.post('/register', AsyncWrapper(userController.register));

module.exports = userRouter;
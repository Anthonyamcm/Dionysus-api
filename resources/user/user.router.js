const express = require('express');
const { AsyncWrapper } = require('../../Common/src/utils/error.service');
const middleware = require('../../Common/src/middleware/auth.middleware');
const userController = require('./user.controller');

const userRouter = express.Router();

userRouter.post('/register', AsyncWrapper(userController.register));
userRouter.post('/login', AsyncWrapper(userController.login));
userRouter.post('/getUserDetailsById', AsyncWrapper(userController.getUserDetails));
userRouter.post('/sendRequest', AsyncWrapper(userController.sendFriendRequest));
userRouter.post('/acceptRequest', AsyncWrapper(userController.acceptFriendRequest));
userRouter.post('/declineRequest', AsyncWrapper(userController.declineFriendRequest));

module.exports = userRouter;
const express = require('express');
const { apiAccess } = require('./Common/src/middleware/auth.middleware');
const userRouter = require('./resources/user/user.router');
const searchRouter = require('./resources/search/search.router')

const router = express.Router();
router.use('/user', userRouter);
router.use('/search', searchRouter);

module.exports = router;
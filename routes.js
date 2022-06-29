const express = require('express');
const { apiAccess } = require('./Common/src/middleware/auth.middleware');
const userRouter = require('./resources/user/user.router');

const router = express.Router();
router.use('/user', userRouter);

module.exports = router;
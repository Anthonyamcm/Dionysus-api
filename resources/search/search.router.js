const express = require('express');
const { AsyncWrapper } = require('../../Common/src/utils/error.service');
const searchController = require('./search.controller');

const transactionRouter = express.Router();
transactionRouter.post('/getAllUsers', AsyncWrapper(searchController.geUsers));

module.exports = transactionRouter;
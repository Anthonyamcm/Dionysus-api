const response = require('../../Common/src/response/response.service');
const searchService = require('./search.service');


module.exports = {
    async geUsers(req, res) {
		try {
			const search = await searchService.getAllUsers(req, req.body)
			response.success(res, search);
		} catch (error) {
			response.exception(res, error);
		}
	},
}
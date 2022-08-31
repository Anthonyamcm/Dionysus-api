/**
 * all errors caught by async wrapper and sent to error handler
 * no need for try catch
 * @param {any} fn The function.
 * @returns The function's result.
 */
const AsyncWrapper = (fn) => {
	return (req, res, next) => {
		return fn(req, res).catch(next);
	};
};

/**
 *
 * @param {*} msgObject
 * @returns
 */
const showMessage = (msgObject) => {
	return `${msgObject.text}`;
};

module.exports = {
	AsyncWrapper,
	showMessage,
};

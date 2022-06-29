const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const getAppDir = () => {
	// sign with RSA SHA256
	const appDir = path.dirname(require.main.filename);
	return appDir;
};

const generateFilename = (prefix) => {
	let id = uuidv4();

	if (prefix) {
		id = prefix + id;
	}

	return id;
};

const deleteFile = (_path, logger = null) => {
	const delFile = (filepath) => {
		try {
			fs.exists(filepath, (v) => {
				if (v) {
					fs.unlinkSync(filepath);
				}
			});
		} catch (e) {
			if (logger && logger.error) {
				logger.error(e);
			}
		}
	};

	if (_path instanceof Array) {
		_path.forEach((element) => {
			if (logger && logger.info) {
				logger.info('element', element);
			}

			delFile(element);
		});
	} else {
		delFile(_path);
	}
};

module.exports = {
	getAppDir,
	generateFilename,
	deleteFile,
};

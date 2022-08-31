const mongoose = require('mongoose');

const { QUERY_LIMIT } = process.env;
const defaultQueryLimit = parseInt(QUERY_LIMIT, 10);

module.exports = {

    getCustomQuery(query, middleware) {
		const customQuery = { ...query };

		if (middleware && middleware.application) {
			customQuery.application = middleware.application._id;
		}
		return customQuery;
	},

	getCustomData(model, data, middleware) {
		const customData = { ...data };

		if (middleware && middleware.application) {
			customData.application = middleware.application._id;
		}

		return customData;
	},
	
	async aggregate(model, options) {
		try {
			if (options.middleware && options.middleware.application) {
				const applicationID = mongoose.Types.ObjectId(options.middleware.application._id);

				for (const subAggregate of options.aggregate) {
					if (subAggregate.$match) {
						subAggregate.$match.application = applicationID;
					} else if (subAggregate.$lookup && subAggregate.$lookup.pipeline) {
						for (const subPipeline of subAggregate.$lookup.pipeline) {
							if (subPipeline.$match && subPipeline.$match.$expr) {
								const applicationExpr = { $eq: ['$application', applicationID] };

								if (subPipeline.$match.$expr.$and) {
									subPipeline.$match.$expr.$and.push(applicationExpr);
								} else {
									const thisExpr = subPipeline.$match.$expr;
									subPipeline.$match.$expr = {};
									subPipeline.$match.$expr.$and = [thisExpr, applicationExpr];
								}
							}
						}
					}
				}
			}

			let query = model.aggregate(options.aggregate);
			query = options.sorts ? query.sort(options.sorts.replace(/,/g, ' ')) : query.sort('-createdAt');
			query = options.skip ? query.skip(options.skip) : query;
			query = options.limit ? query.limit(options.limit) : query.limit(defaultQueryLimit);
			return await query.exec();
		} catch (error) {
			throw error;
		}
	},

	getQueryPagination(totalRecordsCount, skip, limit) {
		const querySkip = skip || 0;
		const queryLimit = limit || defaultQueryLimit;
		const page = Math.floor(querySkip / queryLimit) + 1;
		const pages = Math.ceil(totalRecordsCount / queryLimit);

		return {
			total: totalRecordsCount,
			page,
			pages,
		};
	},

	async aggregateCount(model, options) {
		try {
			if (options.middleware && options.middleware.application) {
				const applicationID = mongoose.Types.ObjectId(options.middleware.application._id);

				for (const subAggregate of options.aggregate) {
					if (subAggregate.$match) {
						subAggregate.$match.application = applicationID;
					} else if (subAggregate.$lookup && subAggregate.$lookup.pipeline) {
						for (const subPipeline of subAggregate.$lookup.pipeline) {
							if (subPipeline.$match && subPipeline.$match.$expr) {
								const applicationExpr = { $eq: ['$application', applicationID] };

								if (subPipeline.$match.$expr.$and) {
									subPipeline.$match.$expr.$and.push(applicationExpr);
								} else {
									const thisExpr = subPipeline.$match.$expr;
									subPipeline.$match.$expr = {};
									subPipeline.$match.$expr.$and = [thisExpr, applicationExpr];
								}
							}
						}
					}
				}
			}

			options.aggregate.push({ $count: 'count' });
			const query = model.aggregate(options.aggregate);
			const count = await query.exec();
			return count[0].count;
		} catch (error) {
			throw error;
		}
	},

	async checkExistingDocument(model, options) {
		try {
			const customQuery = this.getCustomQuery(model, options.query, options.middleware);
			let query = model.findOne(customQuery);
			query = options.populate ? query.populate(options.populate) : query;
			return await query.exec();
		} catch (error) {
			throw error;
		}
	},

	async count(model, options) {
		try {
			const query = model.countDocuments(options.query);
			return await query.exec();
		} catch (error) {
			throw error;
		}
	},

	async find(model, options, opts) {
		try {
			const customQuery = this.getCustomQuery(model, options.query, options.middleware);
			let query = model.find(customQuery, options.select, opts || {});
			query = options.populate ? query.populate(options.populate) : query;
			query = options.sorts ? query.sort(options.sorts.replace(/,/g, ' ')) : query.sort('-createdAt');
			query = options.limit ? query.limit(options.limit) : query;
			query = options.skip ? query.skip(options.skip) : query;
			return await query.exec();
		} catch (error) {
			throw error;
		}
	},

	async fetchOne(model, options, opts) {
		try {
			const customQuery = this.getCustomQuery(model, options.query, options.middleware);
			let query = model.findOne(customQuery, options.select, opts || {});
			query = options.populate ? query.populate(options.populate) : query;
			return await query.exec();
		} catch (error) {
			throw error;
		}
	},

	async fetchOneAndDelete(model, options, opts) {
		try {
			const customQuery = this.getCustomQuery(model, options.query, options.middleware);
			const query = model.findOneAndDelete(customQuery, opts || {});
			return await query.exec();
		} catch (error) {
			throw error;
		}
	},

	async fetchOneAndUpdate(model, options, opts) {
		try {
			const customQuery = this.getCustomQuery(model, options.query, options.middleware);
			const query = model.findOneAndUpdate(customQuery, options.value, opts || {});
			const result = await query.exec();
			return result;
		} catch (error) {
			throw error;
		}
	},

	async save(Model, options, opts) {
		try {
			const customData = this.getCustomData(Model, options.data, options.middleware);
			const result = await new Model(customData).save(opts);
			return result;
		} catch (error) {
			throw error;
		}
	},

	async deleteMany(model, options, opts) {
		try {
			const customQuery = this.getCustomQuery(model, options.query, options.middleware);
			const result = await model.deleteMany(customQuery, opts || {});
			return result;
		} catch (error) {
			throw error;
		}
	},

	async updateMany(model, options, opts) {
		try {
			const customQuery = this.getCustomQuery(model, options.query, options.middleware);
			const result = await model.updateMany(customQuery, options.value, opts || {});
			return result;
		} catch (error) {
			throw error;
		}
	},

	async insertMany(model, options) {
		try {
			const customData = options.data;

			for (const data of customData) {
				data.application = options.middleware && options.middleware.application ? options.middleware.application._id : undefined;
			}

			const result = await model.insertMany(customData);
			return result;
		} catch (error) {
			throw error;
		}
	},

	validateObjectID(id) {
		return mongoose.Types.ObjectId.isValid(id);
	},

	async transaction(callback) {
		let session = null;

		try {
			session = await mongoose.startSession();
			session.startTransaction();

			const opts = { session };
			const result = await callback(opts);

			await session.commitTransaction();
			session.endSession();

			return result;
		} catch (error) {
			await session.abortTransaction();
			session.endSession();

			return Promise.reject(error);
		}
	},
};

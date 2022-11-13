const {sequelize} = require('../domain/model')
const { Transaction } = require("sequelize");

const payJob = async (jobId, profile) => {
	if (!profile.isClient()) {
		return Promise.reject(new Error('only clients can use this EP'))
	}

	return await sequelize.transaction({
  		isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
	}, async (t) => {
		const {Job, Contract, Profile} = sequelize.models
		const job = await Job.findOne({
			where: {
				id: jobId
			},
			include: {
				model: Contract,
				required: true,
				include: [{model: Profile, as: 'Client', required: true, where: {
					id: profile.id
				}}]
			}
		}, {transaction: t})
		if (!job) {
			return Promise.reject(new Error('job does not belongs to client'))
		}

		const contract = await job.getContract()
		const client = await contract.getClient()
		await client.pay(job, t)
	});
}

module.exports = payJob
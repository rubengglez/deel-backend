const {sequelize} = require('../domain/model')
const { Op, Transaction } = require("sequelize");

const addDeposit = async (clientId, amount, profile) => {
	if (!profile.isClient() || profile.id !== clientId) {
		return Promise.rejects('permissions problem')
	}

	return await sequelize.transaction({
  		isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
	}, async (t) => {
		const {Job, Contract, Profile} = sequelize.models
		const totalToPay = await Job.sum('price', {
			where: {
				paid: {[Op.is]: null},
			},
			include: {
				model: Contract,
				required: true,
				include: [{model: Profile, as: 'Client', required: true, where: {
					id: profile.id
				}}]
			}
		}, {transaction: t})

		await profile.addDeposit(amount, totalToPay, t)
	});
}

module.exports = addDeposit
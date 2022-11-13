const {sequelize} = require('../domain/model')
const { Op } = require("sequelize");

const searchContractsByStatuses = require('./searchContractsByStatuses')

const retrieveUnpaidJobs = async (profile) => {
	const {Job} = sequelize.models
	const activeContracts = await searchContractsByStatuses(['in_progress'], profile)
  const contractsIds = activeContracts.map(contract => contract.id)
	if (contractsIds.length === 0) {
		return []
	}

	return Job.findAll({
		where: {
			contractId: {
				[Op.in]: contractsIds
			},
			paid: {[Op.is]: null},
		}
	})
}

module.exports = retrieveUnpaidJobs
const {sequelize} = require('../model')

const searchContractsByStatuses = async (statuses, profile) => {
	return profile.retrieveContractsByStatus(statuses)
}

module.exports = searchContractsByStatuses
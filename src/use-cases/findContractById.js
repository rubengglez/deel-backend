const {sequelize} = require('../domain/model')

const findContractById = async (contractId, profile) => {
	const {Contract} = sequelize.models
	const contract = await Contract.findOne({where: {id: contractId}})
	if (!contract || !profile.canAccess(contract)) {
		return null
	}
	return contract.toJSON()
}

module.exports = findContractById
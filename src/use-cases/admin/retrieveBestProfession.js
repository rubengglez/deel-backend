const {sequelize} = require('../../model')
const { QueryTypes } = require("sequelize");

const retrieveBestProfession = async (start, end) => {
	const {Contract, Profile} = sequelize.models
	const results = await sequelize.query(`
		SELECT max(price), ContractId FROM (
			SELECT sum(price) as price, ContractId FROM Jobs AS Job
			WHERE paid = true and paymentDate >= :start and paymentDate < :end
			GROUP BY ContractId
		)
	`, { type: QueryTypes.SELECT, replacements: {start, end} });

	const contract = await Contract.findOne({
		where: {id: results[0]['ContractId']},
		include: [{model: Profile, as: 'Contractor', required: true }]
	})

	const contractor = await contract.getContractor()
	return contractor.profession
}

module.exports = retrieveBestProfession
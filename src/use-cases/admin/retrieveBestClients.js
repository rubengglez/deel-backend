const {sequelize} = require('../../model')
const { QueryTypes } = require("sequelize");

const DEFAULT_LIMIT = 2

const retrieveBestClients = async (start, end, limit) => {
	if (!limit) {
		limit = DEFAULT_LIMIT
	}

	const results = await sequelize.query(`
		SELECT profileId as id, p.firstName, p.lastName, sum(jobPaid) as paid
		FROM (
			SELECT sum(j.price) as jobPaid, j.ContractId, c.ClientId AS profileId FROM JOBS j
			JOIN Contracts c on c.id = j.ContractId
			WHERE paid = true and paymentDate >= :start and paymentDate < :end
			GROUP BY ContractId
			ORDER BY jobPaid DESC
		)
		JOIN Profiles p on profileId = p.id
		GROUP BY profileId
		ORDER BY paid DESC
		LIMIT :limit
	`, { type: QueryTypes.SELECT, replacements: {start, end, limit} });

	return results.map(result => ({
		id: result['id'],
		fullName: result['firstName'] + " " + result['lastName'],
		paid: result["paid"]
	}))
}

module.exports = retrieveBestClients
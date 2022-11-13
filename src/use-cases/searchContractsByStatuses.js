const searchContractsByStatuses = async (statuses, profile) => {
	const contracts = await profile.retrieveContractsByStatus(statuses)
	return contracts.map(contract => contract.toJSON())
}

module.exports = searchContractsByStatuses
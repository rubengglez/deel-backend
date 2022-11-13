const ApiClient = require('./ApiClient')

describe('Given api is running', function() {
	beforeEach(() => {

	})

	afterEach(() => {

	})

	it('should retrieve a contract by id', async () => {
		const profileId = 2
		const contractId = 4
		const contract = await ApiClient.getContract(contractId, profileId)
		expect(contract.id).toEqual(4)
		expect(contract.status).toEqual('in_progress')
	})

	it('an error should be returned when trying to get a contract of another profile', async () => {
		const profileId = 3
		const contractId = 4
		return expect(ApiClient.getContract(contractId, profileId)).rejects.toThrow("Not Found")
	})

	it('should retrieve a list of non terminated contracts for contractor', async () => {
		const profileId = 6
		const contracts = await ApiClient.contracts(profileId)
		expect(contracts).toHaveLength(3)
		expect(contracts[0].id).toEqual(2)
		expect(contracts[0].status).toEqual("in_progress")
		expect(contracts[1].id).toEqual(3)
		expect(contracts[1].status).toEqual("in_progress")
		expect(contracts[2].id).toEqual(8)
		expect(contracts[2].status).toEqual("in_progress")
	})

	it('should retrieve a list of non terminated contracts for client', async () => {
		const profileId = 1
		const contracts = await ApiClient.contracts(profileId)
		expect(contracts).toHaveLength(1)
		expect(contracts[0].id).toEqual(2)
		expect(contracts[0].status).toEqual("in_progress")
	})
})
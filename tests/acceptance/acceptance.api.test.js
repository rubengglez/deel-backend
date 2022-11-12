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
})
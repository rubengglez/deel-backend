const ApiClient = require('./ApiClient')

describe('Given api is running', function() {
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

	it('should retrieve a list of unpaid jobs for contractor', async () => {
		const profileId = 5
		const unpaidJobs = await ApiClient.unpaidJobs(profileId)
		expect(unpaidJobs).toHaveLength(0)
	})

	it('should retrieve a list of unpaid jobs for client', async () => {
		const profileId = 2
		const unpaidJobs = await ApiClient.unpaidJobs(profileId)
		expect(unpaidJobs).toHaveLength(2)
		expect(unpaidJobs[0].price).toEqual(202)
		expect(unpaidJobs[0].ContractId).toEqual(3)
		expect(unpaidJobs[1].price).toEqual(200)
		expect(unpaidJobs[1].ContractId).toEqual(4)
	})

	it('job can not be paid because profile is not a client', async () => {
		const profileId = 4
		const jobId = 1
		return expect(ApiClient.pay(jobId, profileId)).rejects.toThrow('Forbidden')
	})

	it('job can not be paid because does not belongs to the profile', async () => {
		const profileId = 3
		const jobId = 7
		return expect(ApiClient.pay(jobId, profileId)).rejects.toThrow('Forbidden')
	})

	it('job is paid, then job disappear from unpaid jobs', async () => {
		const profileId = 2
		const jobId = 3
		let unpaidJobs = await ApiClient.unpaidJobs(profileId)
		expect(unpaidJobs).toHaveLength(2)
		expect(unpaidJobs[0].price).toEqual(202)
		expect(unpaidJobs[0].ContractId).toEqual(3)
		expect(unpaidJobs[1].price).toEqual(200)
		expect(unpaidJobs[1].ContractId).toEqual(4)

		await ApiClient.pay(jobId, profileId)

		unpaidJobs = await ApiClient.unpaidJobs(profileId)
		expect(unpaidJobs).toHaveLength(1)
		expect(unpaidJobs[0].price).toEqual(200)
	})
})
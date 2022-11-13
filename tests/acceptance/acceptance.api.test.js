const {sequelize} = require('../../src/model')
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

	it('nothing happens if job is already paid', async () => {
		const profileId = 4
		const jobId = 6
		await ApiClient.pay(jobId, profileId)
	})

	it('should NOT be able to add balance due to client given is not the same than the user given', async () => {
		return expect(ApiClient.deposit(1, 1, 3)).rejects.toThrow('Forbidden')
	})

	describe('Given job can not be paid by not enough balance', () => {
		let job, client, contract

		beforeEach(async () => {
			const {Job, Profile, Contract} = sequelize.models
			client = await Profile.create({
				firstName: 'test',
				lastName: 'test',
				profession: 'test',
				balance: 100,
				type:'client'
			})
			contract = await Contract.create({
      	terms: 'bla bla bla',
      	status: 'in_progress',
      	ClientId: client.id,
      	ContractorId: 6
    	})
			job = await Job.create({
				description: 'work',
      	price: 101,
      	ContractId: contract.id,
			})

			let unpaidJobs = await ApiClient.unpaidJobs(client.id)
			expect(unpaidJobs).toHaveLength(1)

			return expect(ApiClient.pay(job.id, client.id)).rejects.toThrow('Forbidden')
		})

		afterEach(async () => {
			await Promise.all([
				job.destroy(),
				contract.destroy(),
				client.destroy()
			])
		})

		it('should be able to add balance and then pay the job', async () => {
			await ApiClient.deposit(client.id, 10, client.id)
			await ApiClient.pay(job.id, client.id)

			let unpaidJobs = await ApiClient.unpaidJobs(client.id)
			expect(unpaidJobs).toHaveLength(0)
		})

		it('should NOT be able to add balance due to balance given is more than maximum', async () => {
			return expect(ApiClient.deposit(client.id, 30, client.id)).rejects.toThrow('Forbidden')
		})
	})

	it('should return the best profession, end date not included', async () => {
		let start = '2020-08-09T00:00:00.0Z'
		let end = '2020-08-11T00:00:00.0Z'
		const musician = await ApiClient.bestProfessionAsAdmin(start, end)
		expect(musician).toEqual({'profession': 'Musician'})

		start = '2020-08-09T00:00:00.0Z'
		end = '2020-08-20T00:00:00.0Z'
		const programmer = await ApiClient.bestProfessionAsAdmin(start, end)
		expect(programmer).toEqual({'profession': 'Programmer'})
	})

	it('should return the best clients with default limit, end date not included', async () => {
		let start = '2020-08-09T00:00:00.0Z'
		let end = '2020-08-31T00:00:00.0Z'
		let clients = await ApiClient.bestClientsAsAdmin(start, end)
		expect(clients).toEqual([
  		{ id: 4, fullName: 'Ash Kethcum', paid: 2020 },
  		{ id: 2, fullName: 'Mr Robot', paid: 442 },
		])

		start = '2020-08-09T00:00:00.0Z'
		end = '2020-08-12T00:00:00.0Z'
		clients = await ApiClient.bestClientsAsAdmin(start, end)
		expect(clients).toEqual([
  		{ id: 1, fullName: 'Harry Potter', paid: 21 }
		])
	})

	it('should return the best clients by limit', async () => {
		const start = '2020-08-09T00:00:00.0Z'
		const end = '2020-08-31T00:00:00.0Z'
		let limit = 3
		let clients = await ApiClient.bestClientsAsAdmin(start, end, limit)
		expect(clients).toEqual([
  		{ id: 4, fullName: 'Ash Kethcum', paid: 2020 },
  		{ id: 2, fullName: 'Mr Robot', paid: 442 },
  		{ id: 1, fullName: 'Harry Potter', paid: 442 },
		])

		limit = 10
		clients = await ApiClient.bestClientsAsAdmin(start, end, limit)
		expect(clients).toEqual([
  		{ id: 4, fullName: 'Ash Kethcum', paid: 2020 },
  		{ id: 2, fullName: 'Mr Robot', paid: 442 },
  		{ id: 1, fullName: 'Harry Potter', paid: 442 },
  		{ id: 3, fullName: 'John Snow', paid: 200 }
		])
	})
})
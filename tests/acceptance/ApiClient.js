const axios = require('axios');

const URL = 'http://0.0.0.0:3001';

const headers = (profileId) => ({
	headers: {
		'profile_id': profileId
	}
})

async function getContract(contractId, profileId) {
	try {
		const response = await axios.get(`${URL}/contracts/${contractId}`, headers(profileId));
		return response.data;
	} catch (err) {
		throw new Error(err.response.statusText);
	}
}

async function contracts(profileId) {
	try {
		const response = await axios.get(`${URL}/contracts`, headers(profileId));
		return response.data;
	} catch (err) {
		throw new Error(err.response.statusText);
	}
}

async function unpaidJobs(profileId) {
	try {
		const response = await axios.get(`${URL}/jobs/unpaid`, headers(profileId));
		return response.data;
	} catch (err) {
		throw new Error(err.response.statusText);
	}
}

async function pay(jobId, profileId) {
	try {
		const response = await axios.post(`${URL}/jobs/${jobId}/pay`, {}, headers(profileId));
		return response.data;
	} catch (err) {
		throw new Error(err.response.statusText);
	}
}

async function deposit(clientId, amount, profileId) {
	try {
		const response = await axios.post(`${URL}/balances/deposit/${clientId}`, {
			amount
		}, headers(profileId));
		return response.data;
	} catch (err) {
		throw new Error(err.response.statusText);
	}
}

module.exports = {
	getContract,
	contracts,
	unpaidJobs,
	pay,
	deposit,
};
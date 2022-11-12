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

module.exports = {
	getContract,
};
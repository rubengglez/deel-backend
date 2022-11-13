const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./domain/model')
const {getProfile} = require('./middleware/getProfile')
const findContractById = require('./use-cases/findContractById')
const searchContractsByStatuses = require('./use-cases/searchContractsByStatuses')
const retrieveUnpaidJobs = require('./use-cases/retrieveUnpaidJobs')
const payJob = require('./use-cases/payJob')
const addDeposit = require('./use-cases/addDeposit');
const retrieveBestProfession = require('./use-cases/admin/retrieveBestProfession');
const retrieveBestClients = require('./use-cases/admin/retrieveBestClients');

const app = express();
app.use(bodyParser.json());
app.use(getProfile)
app.set('models', sequelize.models)

app.get('/contracts/:id', async (req, res) =>{
    const {id} = req.params
    const contract = await findContractById(id, req.profile)
    if(!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/contracts', async (req, res) =>{
    const contract = await searchContractsByStatuses(['in_progress', 'new'], req.profile)
    if(!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/jobs/unpaid', async (req, res) =>{
    const unpaidJobs = await retrieveUnpaidJobs(req.profile)
    res.json(unpaidJobs)
})

app.post('/jobs/:job_id/pay', async (req, res) => {
    try {
        await payJob(req.params.job_id, req.profile)
        res.json()
    } catch(exception) {
        res.status(403).end()
    }
})

app.post('/balances/deposit/:userId', async (req, res) => {
    try {
        await addDeposit(parseInt(req.params.userId), req.body.amount, req.profile)
        res.json()
    } catch(exception) {
        res.status(403).end()
    }
})

app.get('/admin/best-profession', async (req, res) => {
    try {
        const profession = await retrieveBestProfession(req.query.start, req.query.end)
        res.json({profession})
    } catch(exception) {
        res.status(404).end()
    }
})

app.get('/admin/best-clients', async (req, res) => {
    try {
        const clients = await retrieveBestClients(req.query.start, req.query.end, req.query.limit)
        res.json(clients)
    } catch(exception) {
        res.status(404).end()
    }
})

module.exports = app;

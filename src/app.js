const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const findContractById = require('./use-cases/findContractById')
const searchContractsByStatuses = require('./use-cases/searchContractsByStatuses')

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.get('/contracts/:id',getProfile ,async (req, res) =>{
    const {id} = req.params
    const contract = await findContractById(id, req.profile)
    if(!contract) return res.status(404).end()
    res.json(contract)
})
app.get('/contracts',getProfile ,async (req, res) =>{
    const contract = await searchContractsByStatuses(['in_progress', 'new'], req.profile)
    if(!contract) return res.status(404).end()
    res.json(contract)
})

module.exports = app;

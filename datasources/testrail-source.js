const axios = require('axios');

require('dotenv').config();

const config = {
    baseURL: process.env['testrail.url'],
    headers: {
        'Content-Type' : 'application/json'
    },
    auth: {
        username: process.env['testrail.username'],
        password: process.env['testrail.password']
    },
}

const datasource = {
    readResource: (path, id) => {
        return axios.get(path  + '/' + id, config);
    }
}

module.exports = datasource;
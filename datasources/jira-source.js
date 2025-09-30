const axios = require('axios');

require('dotenv').config();

const config = {
    baseURL: process.env['jira.url'],
    headers: {
        'Content-Type' : 'application/json'
    },
    auth: {
        username: process.env['jira.username'],
        password: process.env['jira.password']
    },
}

const datasource = {
    getIssuesUsingId: (id) => {
        return axios.get('issue/' + id, config);
    },
    getDashboard: (id) => {
        return axios.get('dashboard/' + (id ? id: ''), config);
    },
    getFilterById: (id) => {
        return axios.get('filter/' + id, config);
    },
    searchByUserDefinedJql: (jql) => {
        // console.log('jql-----', jql)
        return axios.get('search/?maxResults=-1&jql=' + jql, config);
    },
    searchByJql: (fixVersion, issueType, statuses, componentsToExclude, priorities) => {
        let statusesMap = statuses.map((status)=> '"' + status + '"').join(',');
        let searchParam = 'project = QSYSDEV AND issuetype =' + issueType + ' AND status in (' + statusesMap + ') AND fixVersion = ' + fixVersion; 
        if(componentsToExclude) {
            let componentNegationMap = componentsToExclude.map((c)=>'"' + c + '"').join(',');
            searchParam+= (' AND component not in (' + componentNegationMap +')');
        }
        if(priorities) {
            let priorityMap = priorities.join(',');
            searchParam+= (' AND priority in (' + priorityMap + ')');
        }

        // console.log('-----', searchParam)
        
        return axios.get('search/?maxResults=-1&jql=' + searchParam, config);
    }
}
// https://qsc.atlassian.net/rest/api/3/search?maxResults=100&jql=project = QSYSDEV AND fixVersion="8.3" AND issuetype = Story  AND status in ("In Progress", "To Do", "Needs Review") 
module.exports = datasource;
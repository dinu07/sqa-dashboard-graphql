const jp = require('jsonpath');

const COMMENTS_LIMIT = 3;
const extractInterestedFieldsInIssue = (json, withDetails) => {
    // console.log('json--', json)
    const issue = {}
    issue.key = json.key;
    if(json.fields) {
        issue.assignee = json.fields.assignee?json.fields.assignee.displayName: '-';
        issue.status =  json.fields.status.name;
        issue.creator = json.fields.creator?json.fields.creator.displayName:'-';
        issue.reporter = json.fields.reporter?json.fields.reporter.displayName:'-';
        issue.title = json.fields.summary;
        issue.type = json.fields.issuetype.name;
        issue.priority = 'P' + json.fields.priority.id;
        issue.components = json.fields.components.map(c => c.name).join(', ');
    }
    
    if(withDetails) {
        issue.description = jp.query( json, "$..description..text").join('<br>');

        issue.comments = [];
        jp.query(json, "$..comments")[0].forEach((comment) => {
            // for each of comment.body.[content].type
            const contents = comment.body.content
            let descriptionText = '';
            contents.forEach((content) => {
                if(content.type === 'paragraph') {
                    let text = jp.query(content, "$..text").join('');
                    if(text) {
                        descriptionText += text;
                    }
                } else {
                    let text = jp.query(content, "$..text").join(', ')
                    if(text.trim().length) {
                        descriptionText += ("\n " + text);
                    }
                }            
            })
            let c = {
                description: descriptionText,
                createdBy: jp.query(comment, "$..updateAuthor.displayName")[0],
                createdOn: jp.query(comment, "$..updated")[0].substr(0, 19).replace('T' ,' '),
            }
            
            issue.comments.push(c)      
        })
        // sort the issues in desc order
        issue.comments = issue.comments.reverse()
        // restricting the number of comments to be returned
        issue.comments = issue.comments.slice(0, COMMENTS_LIMIT);
    }
    return issue;
}

const groupByAssignees = (issues) => {
    const assigneeMap = new Map();
    
    issues.forEach((issue) => {
        const status = issue.status.replace(/ /g,'').toLowerCase();
        const assignee = issue.assignee;
        const currentEntry = assigneeMap.get(assignee);

        if(currentEntry) {
            if(currentEntry[status]) {
                currentEntry[status]++;
            } else {
                currentEntry[status] = 1;
            }
        } else {
            const newEntry = {}
            newEntry[status] = 1;
            assigneeMap.set(assignee, newEntry)
        } 
    });
    const transformed = []
    assigneeMap.forEach((value, key) => {
        const inprogress = value.inprogress?value.inprogress:0
        const todo = value.todo?value.todo:0
        // const todo = Math.round(Math.random() * 100);
        const needsreview = value.needsreview?value.needsreview:0
        const entry = {name: key, needsreview, 
                                  todo,
                                  inprogress,
                                  total: inprogress + todo + needsreview
                                }
        transformed.push(entry);                       
    })
    // console.log('----->', transformed)
    return transformed
}

const groupByPriorities = (issues) => {
    const assigneeMap = new Map();
    
    issues.forEach((issue) => {
        const status = issue.status.replace(/ /g,'').toLowerCase();
        const assignee = issue.priority;
        const currentEntry = assigneeMap.get(assignee);

        if(currentEntry) {
            if(currentEntry[status]) {
                currentEntry[status]++;
            } else {
                currentEntry[status] = 1;
            }
        } else {
            const newEntry = {}
            newEntry[status] = 1;
            assigneeMap.set(assignee, newEntry)
        } 
    });
    const transformed = []
    assigneeMap.forEach((value, key) => {
        const inprogress = value.inprogress?value.inprogress:0
        const todo = value.todo?value.todo:0
        // const todo = Math.round(Math.random() * 100);
        const needsreview = value.needsreview?value.needsreview:0
        const entry = {priority: key, needsreview, 
                                  todo,
                                  inprogress,
                                  total: inprogress + todo + needsreview
                                }
        transformed.push(entry);                       
    })

    const default_entry = (name) => {
        return {
            priority: name,
            needsreview: 0, 
            todo: 0,
            inprogress: 0,
            total: 0
        }
    }
    // provide all P1...P4 even if not available
    // identify and add an entry
    if (transformed.length != 4) {
        if(!transformed.find((entry) => entry.priority === 'P1')) {
            transformed.push(default_entry('P1'))
        }

        if(!transformed.find((entry) => entry.priority === 'P2')) {
            transformed.push(default_entry('P2'))
        }

        if(!transformed.find((entry) => entry.priority === 'P3')) {
            transformed.push(default_entry('P3'))
        }

        if(!transformed.find((entry) => entry.priority === 'P4')) {
            transformed.push(default_entry('P4'))
        }
    }

    return transformed
}
module.exports = { extractInterestedFieldsInIssue, groupByAssignees, groupByPriorities } ;
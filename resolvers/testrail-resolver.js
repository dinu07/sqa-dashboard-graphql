const testRailDS = require('../datasources/testrail-source');
const jiraDS = require('../datasources/jira-source');
const jiraUtil = require('../datasources/jira-util');
const GraphQLDateTime = require('graphql-iso-date');

const localComments = [
  {
    description: "8.3 testing in progress",
    createdBy: "Gopa",
    createdOn: new Date()
  },
  {
    description: "8.2 testing in progress",
    createdBy: "Test",
    createdOn: new Date(2010, 12, 1)
  },
  {
    description: "8.1 testing in progress",
    createdBy: "Gopa",
    createdOn: new Date(2010, 8, 15)
  },
];
let localCommentsIdx = 1;

const books = [
    {
      title: 'Harry Potter and the Chamber of Secrets',
      author: 'J.K. Rowling',
      year: 2000
    },
    {
      title: 'Jurassic Park',
      author: 'Michael Crichton',
      year: 2001
    },
  ];

  const doesDescriptionMatch = (descText, descMatchArr) => {
    if(!descMatchArr) {
      return true;
    }
    return ( descMatchArr.find((d)=> descText && descText.indexOf(d) != -1) != null )
  }
  const get_plans = (parent, {descriptionContainsText}) => testRailDS.readResource('get_plans', parent.project_id)
                                .then(res => {
                                  const testplans = res.data;
                                  // console.log('parent.id', parent.id)
                                  return testplans.filter((testplan) => testplan.milestone_id === parent.id && doesDescriptionMatch(testplan.description, descriptionContainsText));
                                })

  const get_runs = (parent, {descriptionContainsText}) => testRailDS.readResource('get_runs', parent.project_id)
                                .then(res => {
                                  const runs = res.data;
                                  // console.log('parent.id', parent.id)
                                  return runs.filter((testrun) => testrun.milestone_id === parent.id && doesDescriptionMatch(testrun.description, descriptionContainsText));
                                })

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    DateTime: GraphQLDateTime,
    Mutation: {
      postComment(parent, {desc, created}) {
        console.log('.............', desc)
        localComments.push({id: localCommentsIdx++, description: desc, createdOn: created})
        return localComments[localComments.length - 1]
      }
    },
    Query: {
      comments: (parents, {issueId}) => localComments,
      books: () => books,
      book: (parent, {title}) => books.find((book) => {
          // console.log('title-----:', args.title);
          // console.log('book.title-----', book.title);
          if(book.title === title) {
            return book;
          }
      }),
      project: (parent, { id }) => {
          // console.log('projct')
          return testRailDS.readResource('get_project', id).then((res) => {
            //   console.log('---', res)
              return res.data;
          })
      },
      milestone: (parent, { id }) => {
        // console.log('parent---', parent)
        // console.log('milestone')
        return testRailDS.readResource('get_milestone', id).then((res) => {
            // console.log('---', res)
            return res.data;
        })
      },
      issues: (parent, {fixVersion, issueType, status}) => {
        return jiraDS.searchByJql(fixVersion, issueType, status).then((res) => {
          const issuesResults = res.data.issues;
          // console.log('issuesResults', issuesResults)
          return issuesResults.map((issue) => jiraUtil.extractInterestedFieldsInIssue(issue));
        })
      },
      overallStatus: (parent, {milestoneId, issueId}) => {
        return testRailDS.readResource('get_milestone', milestoneId).then((res) => {
          // console.log('---', res)
          const milestone = res.data

          return jiraDS.getIssuesUsingId(issueId).then((res) => {
            // console.log(res.data)
            const issue = jiraUtil.extractInterestedFieldsInIssue(res.data, true)

            // console.log('overall status', milestone.is_completed , issue.status, milestone.name);
            
            const milestoneStatus = milestone.is_completed
            const issueStatus = (issue.status == 'Done')
            return {
              name: milestone.name,
              milestoneStatus,
              issueStatus,
            } 
          })
        })
        
      },
      issue: (parent, {id}) => {
        return jiraDS.getIssuesUsingId(id).then((res) => {
          // console.log(res.data)
          return jiraUtil.extractInterestedFieldsInIssue(res.data, true)
        })
      },
      issuesGroupedByAssignee: (parent, {fixVersion, issueType, componentsToExclude, priorities}) => {
        const status = ["In Progress", "In progress", "To Do", "Needs Review"]
        return jiraDS.searchByJql(fixVersion, issueType, status, componentsToExclude, priorities).then((res) => {
          const issuesResults = res.data.issues;
          //  console.log('issuesResults', issuesResults)
          return jiraUtil.groupByAssignees(issuesResults.map((issue) => jiraUtil.extractInterestedFieldsInIssue(issue)))
          
        })
      },
      issuesGroupedByPriority: (parent, {jql}) => {
        // console.log('issuesGroupedByPriority', jql)
        return jiraDS.searchByUserDefinedJql(jql).then((res) => {
          // console.log('issuesResults', res.data.issues.length)
          const issuesResults = res.data.issues;
          const results = jiraUtil.groupByPriorities(issuesResults.map((issue) => jiraUtil.extractInterestedFieldsInIssue(issue)))
          return results;
          
        })
      },
      issuesByJql: (parent, {jql}) => {
        return jiraDS.searchByUserDefinedJql(jql).then((res) => {
          const issuesResults = res.data.issues;
          const results = (issuesResults.map((issue) => jiraUtil.extractInterestedFieldsInIssue(issue)))
          return results
        }, (err)=> console.log("error occurred while performing query ---", err.response.data))
      }
    },
    Project: {
        milestones: (parent, {name}) => {
            return testRailDS.readResource('get_milestones', parent.id).then((res) => {
                if(name == null) {
                  return res.data
                } else {
                  return res.data.filter((m)=> m.name === name);
                }
            })
        }
    },
    Milestone: {
        isStarted: (parent) => {
          return parent.is_started;
        },
        isCompleted: (parent) => {
          return parent.is_completed;
        },
        testplans: (parent, {descriptionContainsText}) => {
          // console.log('parent----', parent)
          return get_plans(parent, {descriptionContainsText})
        },
        testruns: (parent, {descriptionContainsText}) => {
          return get_runs(parent, {descriptionContainsText})
        },
        issues: (parent, {fixVersion, issueType, status}) => {
          return jiraDS.searchByJql(fixVersion, issueType, status).then((res) => {
            const issuesResults = res.data.issues;
            return issuesResults.map((issue) => jiraUtil.extractInterestedFieldsInIssue(issue));
          })
        },
        results_stats: (parent, {descriptionContainsText}) => {
            // console.log('-----')
            return get_plans(parent, {descriptionContainsText}).then((test_plans) => {
              
              let passed_count=  0,blocked_count = 0, untested_count = 0, retest_count = 0,failed_count = 0;
              test_plans.forEach((test_plan) => {
                passed_count+=test_plan.passed_count
                blocked_count+=test_plan.blocked_count
                untested_count+=test_plan.untested_count
                retest_count+=test_plan.retest_count
                failed_count+=test_plan.failed_count
              })
              
              // console.log('.........test_plans', test_plans)

              return get_runs(parent, {descriptionContainsText}).then((test_runs) => {

                test_runs.forEach((test_run) => {
                  passed_count+=test_run.passed_count
                  blocked_count+=test_run.blocked_count
                  untested_count+=test_run.untested_count
                  retest_count+=test_run.retest_count
                  failed_count+=test_run.failed_count
                })
              
                // console.log('.........test_runs', test_runs.length)
                return {
                  passed_count,
                  blocked_count,
                  untested_count,
                  retest_count,
                  failed_count
                }
              })

            })
        }
    },
    TestPlan: {
      testruns: (parent) => {
        return testRailDS.readResource('get_plan', parent.id)
                .then(res => {
                  const testplan = res.data;
                  const testruns = [];
                  testplan.entries.forEach((entry) => { 
                      entry.runs.forEach((testrun) => testruns.push(testrun))
                  })
                  // console.log('tetruns', testruns)
                  return testruns;
                })
        
      },
    },
    TestRun: {
      test_results: (parent) => {
        return testRailDS.readResource('get_tests', parent.id)
              .then(res => {
                return res.data;
              })
      }
    },
    TestStatus: {
      Passed: 1,
      Blocked: 2,
      Untested: 3,
      Retested: 4,
      Failed: 5
    },
    Test: {
      status: (parent) => parent.status_id,
      section: (parent) => {
        // console.log('case_id', parent.case_id)
        return testRailDS.readResource('get_case', parent.case_id)
          .then((res) => {
            // console.log('section-id', res.data.section_id);
            return testRailDS.readResource('get_section', res.data.section_id)
              .then((res)=> res.data)
          })
      }
    },
};

module.exports = resolvers;
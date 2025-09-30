### Prerequisite

 - Should have node v10+ installed. 

### First time setup

 - Execute ``` npm install ```

### How to start the application.

Execute ``` npm start ```

### Demo

Access the url - http://localhost:4000/

```
{
    project(id: 5) {
    id,
    name,
    url,
    milestones (name: "v8.3 Release  Milestone") {
      name,
      description,
      url,
      isStarted,
      isCompleted,
      testruns {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url
      },
      testplans {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url,
        testruns {
          id,
        	name,
          failed_count,
          passed_count,
          retest_count,
          blocked_count,
          url
        }
      }
    }
  }
}
```

With test results
```
{
    project(id: 5) {
    id,
    name,
    url,
    milestones (name: "v8.3 Release  Milestone") {
      name,
      description,
      url,
      isStarted,
      isCompleted,
      testruns {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url
      },
      testplans {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url,
        testruns {
          id,
        	name,
          failed_count,
          passed_count,
          retest_count,
          blocked_count,
          test_results {
            id,
            title,
            status
          }
        }
      }
    }
  }
}
```

With section details
```
{
    project(id: 5) {
    id,
    name,
    url,
    milestones (name: "v8.3 Release  Milestone") {
      name,
      description,
      url,
      isStarted,
      isCompleted,
      testruns {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url
      },
      testplans {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url,
        testruns {
          id,
        	name,
          failed_count,
          passed_count,
          retest_count,
          blocked_count,
          test_results {
            id,
            title,
            status,
            section {
              name,
              id
            }
          }
        }
      }
    }
  }
}
```
With Issues
```
{
    project(id: 5) {
    id,
    name,
    url,
    milestones (name: "v8.3 Release  Milestone") {
      name,
      description,
      url,
      isStarted,
      isCompleted,
      issues (fixVersion: "8.3"){
        key,
        assignee,
        title,
        status
      }
      testruns {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url
      },
      testplans {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url,
        testruns {
          id,
        	name,
          failed_count,
          passed_count,
          retest_count,
          blocked_count,
          test_results {
            id,
            title,
            status,
          }
        }
      }
    }
  }
}
```

With status
```
{
    project(id: 5) {
    id,
    name,
    url,
    milestones (name: "v8.3 Release  Milestone") {
      name,
      description,
      url,
      isStarted,
      isCompleted,
      issues (fixVersion: "8.3", issueType: "Story", status: ["In Progress", "To Do", "Needs Review"]){
        key,
        assignee,
        title,
        status
      }
      testruns {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url
      },
      testplans {
        id,
        name,
        failed_count,
        passed_count,
        retest_count,
        blocked_count,
        url,
        testruns {
          id,
        	name,
          failed_count,
          passed_count,
          retest_count,
          blocked_count,
          test_results {
            id,
            title,
            status,
          }
        }
      }
    }
  }
}
```

#### Libraries References

 - axios - https://github.com/axios/axios

 - apollo graphql - https://www.apollographql.com/docs/tutorial/data-source/


 ### Containerized application running

 - to build the application, execute ```docker build . -t sqa-dashboard-graphql`
 - to run the application, execute ```docker run sqa-dashboard-graphql`

 ### docker compose running

 - execute ```docker-compose up```
 - to stop execute ```docker-compose down```
 
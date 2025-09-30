// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `
  scalar DateTime
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type BookYear inherits Book {
    year: Int
  }

  type Project {
    id: Int!, 
    name: String,
    url: String,
    milestones (name: String): [Milestone]
  }

  type Milestone {
    id: Int!,
    name: String,
    description: String,
    url: String,
    isStarted: Boolean,
    isCompleted: Boolean,
    project_id: Int!,
    testplans (descriptionContainsText: [String]): [TestPlan],
    testruns (descriptionContainsText: [String]): [TestRun],
    issues (fixVersion: String!, issueType: String!, status: [String]!): [Issue],
    results_stats (descriptionContainsText: [String]): ResultStats  
  }

  type BasicTestPlanRun {
    id: Int!,
    name: String,
    description: String,
    milestone_id: Int,
    passed_count: Int,
    blocked_count: Int,
    untested_count: Int,
    retest_count: Int,
    failed_count: Int,
    project_id: Int,
    url: String,
  }
  type TestPlan inherits BasicTestPlanRun {
    testruns: [TestRun]
  }

  type TestRun inherits BasicTestPlanRun {
    test_results: [Test]
  }

  type Section {
    id: Int!,
    name: String,
    description: String
  }

  type Test {
    id: Int!,
    case_id: Int,
    status_id: Int,
    run_id: Int,
    title: String,
    template_id: Int,
    type_id: Int,
    priority_id: Int,
    status: TestStatus,
    section: Section
  }

  enum TestStatus {
    Passed,
    Failed, 
    Blocked,
    Retested, 
    Untested,
  }

  type Issue {
    key: String,
    assignee: String,
    status: String,
    creator: String,
    reporter: String,
    title: String,
    type: String,
    priority: String,
    description: String,
    components: String,
    comments: [Comment]
  }

  type IssuesByAssignee {
    name: String,
    inprogress: Int,
    todo: Int,
    needsreview: Int,
    total: Int
  }

  type IssuesByPriority {
    priority: String,
    inprogress: Int,
    todo: Int,
    needsreview: Int,
    total: Int
  }

  type ResultStats {
    passed_count: Int,
    blocked_count: Int,
    untested_count: Int,
    retest_count: Int,
    failed_count: Int
  }

  type Comment {
    description: String,
    createdBy: String
    createdOn: DateTime
  }

  type OverallStatus {
    name: String,
    milestoneStatus: Boolean,
    issueStatus: Boolean
  }

  type Mutation {
    postComment(desc: String!, created: String!): Comment 
  }
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [BookYear]
    book (title: String!): BookYear,
    project (id: Int!): Project,
    milestones (projectId: Int!): [ Milestone ],
    milestone (id: Int!): Milestone,
    issues(fixVersion: String!, issueType: String!, status: [String]): [Issue],
    issuesGroupedByAssignee(fixVersion: String!, issueType: String!, componentsToExclude: [String], priorities: [String]): [IssuesByAssignee],
    comments(issueId: String!): [Comment],
    issuesGroupedByPriority(jql: String!): [IssuesByPriority],
    issuesByJql(jql: String!): [Issue],
    issue(id: String!): Issue,
    overallStatus(milestoneId: Int!, issueId: String!): OverallStatus
  }
`;

module.exports = typeDefs;
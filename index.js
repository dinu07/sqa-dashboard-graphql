const { ApolloServer, makeExecutableSchema } = require('apollo-server');
const { transpileSchema } = require('graphql-s2s').graphqls2s

const resolvers = require('./resolvers/testrail-resolver');
const typeDefs = require('./typedefs/testrail-typedef');

const logger = { log: e => console.log(e , '!!!!!!!') }

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const schema = makeExecutableSchema({
  resolvers,
  typeDefs: [transpileSchema(typeDefs)],
  logger
});

const server = new ApolloServer({ schema});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});  
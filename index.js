const { ApolloServer } = require('apollo-server')
require('./config/mongodb')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const { extractToken } = require('./utils/validationData')

// the graphql instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: (req) => {
    const user = extractToken(req)

    return user
  }
})

// graphql server
server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`)
})
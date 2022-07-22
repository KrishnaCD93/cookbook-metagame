require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const typeDefs = require('./type-defs/typeDefs');
const resolvers = require('./resolvers/resolvers');

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  credentials: 'omit',
});

async function startApolloServer(server) {
  const { url } = await server.listen({port: process.env.PORT || 4000});
  console.log(`🚀 Server ready at ${url}`);
}
startApolloServer(server);
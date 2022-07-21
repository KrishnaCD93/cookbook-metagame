require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const typeDefs = require('./type-defs/typeDefs');
const resolvers = require('./resolvers/resolvers');

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  csrfPrevention: true,
  cache: 'bounded'
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
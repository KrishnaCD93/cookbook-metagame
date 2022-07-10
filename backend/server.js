require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const typeDefs = require('./type-defs/typeDefs');
const resolvers = require('./resolvers/resolvers');
const { generateNonce } = require('siwe');

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  context: ({ req }) => {
    const { token } = req.headers;
    const nonce = generateNonce();
    return {
      token,
      nonce,
    };
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const typeDefs = require('./type-defs/typeDefs');
const resolvers = require('./resolvers/resolvers');

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  introspection: true,
  cors: {
    credentials: true,
    origin: '*'
  //   origin: (origin, callback) => {
  //     const whitelist = [
  //       "https://cookbook.social",
  //       "https://studio.apollographql.com",
  //       "http://localhost:3000"
  //     ];
  //     if (whitelist.indexOf(origin) !== -1) {
  //       callback(null, true)
  //     } else {
  //       callback(new Error("Not allowed by CORS"))
  //     }
  //   }
  }
});

async function startApolloServer(server) {
  const { url } = await server.listen({port: process.env.PORT || 4000});
  console.log(`🚀 Server ready at ${url}`);
}
startApolloServer(server);
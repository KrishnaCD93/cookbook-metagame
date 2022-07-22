require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./type-defs/typeDefs');
const resolvers = require('./resolvers/resolvers');

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  introspection: true,
  cors: false
});

async function startApolloServer(server) {
  await server.start();
  const corsOptions = {
    origin: [
      "https://cookbook.social",
      "https://studio.apollographql.com",
      "http://localhost:3000"
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }
  const app = express();
  server.applyMiddleware({ app, path: '/', cors: corsOptions });

  app.listen({port: process.env.PORT || 4000});
  console.log(`🚀 Server ready at ${process.env.PORT || 4000}`);
}
startApolloServer(server);

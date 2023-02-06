require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./type-defs/typeDefs');
const resolvers = require('./resolvers/resolvers');
const { json, urlencoded } = require('express');

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  introspection: true,
  cors: false,
  context: ({ req }) => {
    const auth = {
      signature: '',
      message: '',
      token: '',
      type: '',
    };
    const bearer = req.headers.authorization || '';
    authType = bearer.split(' ')[0];
    if (authType === 'SIGNATURE') {
      auth.signature = bearer.split(' ')[1];
      auth.message = bearer.split(' ')[2];
      auth.type = authType;
      return { auth };
    } else if (authType === 'JWT') {
      auth.token = bearer.split(' ')[1];
      auth.type = authType;
      return { auth };
    } else {
      auth.type = 'NONE';
      return { auth };
    }
  },
});

async function startApolloServer(server) {
  await server.start();
  const corsOptions = {
    origin: (origin, callback) => {
      const whitelist = [
        "https://cookbook.social",
        "https://studio.apollographql.com",
        "http://localhost:3000",
      ]
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    credentials: true,
  }
  const app = express();
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  server.applyMiddleware({ app, path: '/', cors: corsOptions });

  app.listen({port: process.env.PORT || 4000});
  console.log(`🚀 Server ready at ${process.env.PORT || 4000}`);
}
startApolloServer(server);

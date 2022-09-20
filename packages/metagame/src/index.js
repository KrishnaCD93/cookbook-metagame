import { ChakraProvider, ColorModeScript, theme } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import {
  WagmiConfig,
  createClient,
  chain,
  configureChains,
} from 'wagmi'

import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import ShowRecipes from './routes/recipes/ShowRecipes';
import Home from './routes/Home';
import About from './routes/About';
import CookbookGoals from './routes/CookbookGoals';
import MetaKitchen from './routes/YourKitchen';
import RecipeDetail from './routes/recipes/RecipeDetail';
import Recipes from './routes/recipes/Recipes';
import EditRecipe from './routes/recipes/EditRecipe';

// TODO: add recipe page with recipeID

const { chains, provider, webSocketProvider } = configureChains(
  [chain.polygon], 
  [
  alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
  publicProvider(),
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});
// Set up client
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
})

const link = new HttpLink({
  uri: 'https://cookbook-metagame.herokuapp.com/', // 'http://localhost:4000', 
  credentials: 'include',
  fetchOptions: {
    mode: 'cors',
    accessControlAllowMethods: 'POST, GET, PUT, DELETE, OPTIONS',
  }
});

const authLink = setContext((_, { headers }) => {
  const signature = localStorage.getItem('signature');
  return {
    headers: {
      ...headers,
      authorization: signature ? `Bearer ${signature}` : '',
    },
  };
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  credentials: 'include',
  link: authLink.concat(link),
});

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <StrictMode>
    <ColorModeScript />
    <ApolloProvider client={apolloClient}>
      <ChakraProvider theme={theme}>
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <HashRouter>
              <Routes>
                <Route path="/" element={<App />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="recipes" element={<Recipes />}>
                    <Route index element={<ShowRecipes />} />
                    <Route path=":recipeID" element={<RecipeDetail />} />
                    <Route path=":recipeID/edit" element={<EditRecipe />} />
                  </Route>
                  <Route path="kitchen" element={<MetaKitchen />} />
                  <Route path="goals" element={<CookbookGoals />} />
                  <Route
                    path="*"
                    element={
                      <main style={{ padding: "1rem" }}>
                        <p>There's nothing here yet!</p>
                      </main>
                    }
                  />
                </Route>
              </Routes>
            </HashRouter>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </ApolloProvider>
  </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

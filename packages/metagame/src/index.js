import { ChakraProvider, ColorModeScript, theme } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';

import {
  WagmiConfig,
  createClient,
  chain,
  configureChains,
} from 'wagmi'

import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

// import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
// import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, provider, webSocketProvider } = configureChains([chain.mainnet, chain.polygon], [
  alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
  publicProvider(),
])
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
  uri: 'https://cookbook-metagame-server.herokuapp.com/', // 'http://localhost:4000', 
  credentials: 'include',
  fetchOptions: {
    mode: 'cors'
  }
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  credentials: 'include',
  link
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
            <App />
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

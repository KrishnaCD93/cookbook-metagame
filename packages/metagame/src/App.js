import React, { useEffect, useState } from 'react';
import { Box, VStack, Grid, useDisclosure, Button, Flex, GridItem, Heading } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CreateRecipe from './CreateRecipe';
import CreateCookbook from './CreateCookbook';
import ShowRecipes from './ShowRecipes';

import {Cloudinary} from "@cloudinary/url-gen";

import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

const domain = window.location.host;
const origin = window.location.origin;
let signer;
if (window.ethereum) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
}

function App() {
  const { isOpen: recipeIsOpen, onOpen: recipeOnOpen, onClose: recipeOnClose } = useDisclosure();
  const { isOpen: cookbookIsOpen, onOpen: cookbookOnOpen, onClose: cookbookOnClose } = useDisclosure();
  const [accountInfo, setAccountInfo] = useState('');

  const cld = new Cloudinary({
    cloud: {
      cloudName: 'cookbook-social'
    },
    url: {
      secureDistribution: 'cookbook.social', 
      secure: true 
    }
  });

  function createSiweMessage (address, statement) {
    const message = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: '1',
      chainId: '1'
    });
    return message.prepareMessage();
  }

  async function signMessageWithEthereum () {
    const message = createSiweMessage(
        await signer.getAddress(), 
        'Sign message with Ethereum to the app.'
      );
    const signed = await signer.signMessage(message);
    return signed
  }

  useEffect(() => {
    if (signer) {
      async function getAccountInfo() {
        setAccountInfo(await signer.getAddress());
      }
      getAccountInfo();
    }
  }, []);

  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3} spacing={8}>
        <Flex justifySelf="flex-end">
          <Box>
            <ConnectButton label='Connect Address' />
          </Box>
          <ColorModeSwitcher />
        </Flex>
        <GridItem>
        <VStack>
          <Heading>Welcome to the Cookbook Metagame!</Heading>
          <Button onClick={recipeOnOpen}>Add Recipe</Button>
          <Button onClick={cookbookOnOpen}>Add Cookbook</Button>
          <CreateRecipe isOpen={recipeIsOpen} onClose={recipeOnClose}
            signMessageWithEthereum={signMessageWithEthereum} accountInfo={accountInfo} />
          <CreateCookbook isOpen={cookbookIsOpen} onClose={cookbookOnClose} signMessageWithEthereum={signMessageWithEthereum} accountInfo={accountInfo} />
        </VStack>
        </GridItem>
        <GridItem>
        <ShowRecipes cld={cld} />
        </GridItem>
      </Grid>
    </Box>
  );
}

export default App;

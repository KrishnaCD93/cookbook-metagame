import React from 'react';
import { Box, VStack, Grid, useDisclosure, Button, Flex, GridItem, Image, Spacer, useColorModeValue, Text } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import CreateRecipe from './CreateRecipe';
import ViewCookbook from './ViewCookbook';
import ShowRecipes from './ShowRecipes';

import { Cloudinary } from "@cloudinary/url-gen";
import Profile from './components/Profile';
import { useAccount } from 'wagmi';

import wordmark from './assets/wordmark.svg';
import altWordmark from './assets/alt-wordmark.svg';
import logomark from './assets/logomark.png';
import altLogomark from './assets/alt-logomark.png';

window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  const { isOpen: walletIsOpen, onOpen: walletOnOpen, onClose: walletOnClose } = useDisclosure();
  const { isOpen: recipeIsOpen, onOpen: recipeOnOpen, onClose: recipeOnClose } = useDisclosure();
  const { isOpen: cookbookIsOpen, onOpen: cookbookOnOpen, onClose: cookbookOnClose } = useDisclosure();
  const { isConnected } = useAccount();

  const cld = new Cloudinary({
    cloud: {
      cloudName: 'cookbook-social'
    }
  })

  const wordmarkLogo = useColorModeValue(wordmark, altWordmark);
  const logomarkLogo = useColorModeValue(logomark, altLogomark);

  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3} spacing={8}>
        <Flex>
          <Image onClick={() => window.location.reload()}
            src={logomarkLogo} alt="Cookbook Social" h='50px' borderRadius={8} _hover={{ border: '1px solid #000', cursor: 'pointer' }} />
          <Spacer />
          <Box>
            {!isConnected && <Button h='50px' onClick={walletOnOpen}>Connect Wallet</Button>}
            <Profile isOpen={walletIsOpen} onClose={walletOnClose} />
          </Box>
          <ColorModeSwitcher />
        </Flex>
        <GridItem>
        <VStack>
          <Image src={wordmarkLogo} alt="Cookbook Social" h='25vh' borderRadius={8} />
          <Box justifyItems='flex-start'>
            <Text>A recipe sharing platform for foodies to contribute tastes.</Text>
            <Text>Welcome to the social metagame.</Text>
          </Box>
          <Button onClick={recipeOnOpen}>Add A Recipe</Button>
          <Button onClick={cookbookOnOpen}>View Your Cookbook</Button>
          <CreateRecipe isOpen={recipeIsOpen} onClose={recipeOnClose} />
          <ViewCookbook isOpen={cookbookIsOpen} onClose={cookbookOnClose} />
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

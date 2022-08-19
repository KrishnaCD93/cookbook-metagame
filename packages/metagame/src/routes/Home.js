import { Box, Button, Divider, GridItem, Image, Text, useColorModeValue, useDisclosure, VStack } from '@chakra-ui/react';
import React from 'react';
import CreateRecipe from '../components/CreateRecipe';
import ShowCookbookTokens from '../components/ShowCookbookTokens';

import wordmark from '../assets/wordmark.svg';
import altWordmark from '../assets/alt-wordmark.svg';
import CreateRequest from '../components/CreateRequest';

const Home = () => {
  const { isOpen: recipeIsOpen, onOpen: recipeOnOpen, onClose: recipeOnClose } = useDisclosure();
  const { isOpen: requestRecipeIsOpen, onOpen: requestRecipeOnOpen, onClose: requestRecipeOnClose } = useDisclosure();

  const wordmarkLogo = useColorModeValue(wordmark, altWordmark);
  return ( 
    <>
    <GridItem>
      <VStack mb={4}>
        <Box>
          <Image src={wordmarkLogo} alt="Cookbook Social" h='25vh' borderRadius={8} />
          <Text>A community for foodies to contribute tastes and discover recipes.</Text>
          <Text>Welcome to the social metagame!</Text>
        </Box>
        <Button onClick={recipeOnOpen}>Add Recipe</Button>
        <CreateRecipe isOpen={recipeIsOpen} onClose={recipeOnClose} />
        <Button onClick={requestRecipeOnOpen}>Request Recipe</Button>
        <CreateRequest isOpen={requestRecipeIsOpen} onClose={requestRecipeOnClose} />
      </VStack>
    </GridItem>
    <Divider />
    <GridItem>
      <ShowCookbookTokens />
    </GridItem>
    </>
  );
}

export default Home;
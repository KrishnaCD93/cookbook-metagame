import { Box, Button, Divider, GridItem, Image, Text, useColorModeValue, useDisclosure, VStack } from '@chakra-ui/react';
import React from 'react';
import CreateRecipe from '../CreateRecipe';
import ShowRecipes from './ShowRecipes';

import wordmark from '../assets/wordmark.svg';
import altWordmark from '../assets/alt-wordmark.svg';

const Home = () => {
  const { isOpen: recipeIsOpen, onOpen: recipeOnOpen, onClose: recipeOnClose } = useDisclosure();

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
        <Button onClick={recipeOnOpen}>Add A Recipe</Button>
        <CreateRecipe isOpen={recipeIsOpen} onClose={recipeOnClose} />
      </VStack>
    </GridItem>
    <Divider />
    <GridItem>
      <ShowRecipes />
    </GridItem>
    </>
  );
}

export default Home;
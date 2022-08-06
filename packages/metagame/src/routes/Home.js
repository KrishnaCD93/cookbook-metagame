import { AspectRatio, Box, Button, Divider, GridItem, Image, Text, useColorModeValue, useDisclosure, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import CreateRecipe from '../CreateRecipe';
import ShowRecipes from './ShowRecipes';

import wordmark from '../assets/wordmark.svg';
import altWordmark from '../assets/alt-wordmark.svg';

const Home = () => {
  const { isOpen: recipeIsOpen, onOpen: recipeOnOpen, onClose: recipeOnClose } = useDisclosure();
  const [recipeCreated, setRecipeCreated] = useState(false);

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
        <Button onClick={recipeOnOpen}>What's for Lunch</Button>
        <CreateRecipe isOpen={recipeIsOpen} onClose={recipeOnClose} setRecipeCreated={setRecipeCreated} />
      </VStack>
    </GridItem>
    <Divider />
    <GridItem>
      {<AspectRatio maxW='1080px'>
      <iframe
      src="https://gateway.ipfscdn.io/ipfs/QmUfp6thZQTmNKS6tzijJpxdoBe9X7spHwzRjUh3RPTAwF/edition-drop.html?contract=0x0dBC9A0649EeCa0f6b2005d833A6456EC10090EE&chainId=137&tokenId=0"
      width="600px"
      height="600px"
      frameborder="0"
      title='Cookbook Social Silver Spoon'
      ></iframe>
      </AspectRatio>}
    </GridItem>
    <GridItem>
      <ShowRecipes />
    </GridItem>
    </>
  );
}

export default Home;
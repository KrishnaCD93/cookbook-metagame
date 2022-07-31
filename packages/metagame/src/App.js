import React from 'react';
import { Box, VStack, Grid, useDisclosure, Button, Flex, GridItem, Heading } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import CreateRecipe from './CreateRecipe';
import CreateCookbook from './CreateCookbook';
import ShowRecipes from './ShowRecipes';

import {Cloudinary} from "@cloudinary/url-gen";
import Profile from './Profile';

window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  const { isOpen: recipeIsOpen, onOpen: recipeOnOpen, onClose: recipeOnClose } = useDisclosure();
  const { isOpen: cookbookIsOpen, onOpen: cookbookOnOpen, onClose: cookbookOnClose } = useDisclosure();

  const cld = new Cloudinary({
    cloud: {
      cloudName: 'cookbook-social'
    }
  })

  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3} spacing={8}>
        <Flex justifySelf="flex-end">
          <Box>
            <Profile />
          </Box>
          <ColorModeSwitcher />
        </Flex>
        <GridItem>
        <VStack>
          <Heading>Welcome to Cookbook.Social!</Heading>
          <Button onClick={recipeOnOpen}>Add A Recipe</Button>
          <Button onClick={cookbookOnOpen}>View Your Cookbook</Button>
          <CreateRecipe isOpen={recipeIsOpen} onClose={recipeOnClose} />
          <CreateCookbook isOpen={cookbookIsOpen} onClose={cookbookOnClose} />
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

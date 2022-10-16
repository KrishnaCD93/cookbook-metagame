import { Box, Button, Divider, GridItem, Image, Text, useColorModeValue, useDisclosure, VStack } from '@chakra-ui/react';
import React, { useRef } from 'react';

import wordmark from '../assets/wordmark.svg';
import altWordmark from '../assets/alt-wordmark.svg';
import CreateRequest from '../components/CreateRequest';
import WhatCookbook from '../components/WhatCookbook';
import CreateRecipeButton from '../components/CreateRecipeButton';

const Home = () => {
  const { isOpen: requestRecipeIsOpen, onOpen: requestRecipeOnOpen, onClose: requestRecipeOnClose } = useDisclosure();
  const learnMoreRef = useRef(null);
  const learnMoreScroll = () => learnMoreRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })

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
        <CreateRecipeButton />
        <Button onClick={requestRecipeOnOpen}>Request Recipe</Button>
        <CreateRequest isOpen={requestRecipeIsOpen} onClose={requestRecipeOnClose} />
        <Button variant={'link'} size='sm' onClick={learnMoreScroll}>
          Learn more
        </Button>
      </VStack>
    </GridItem>
    <Divider />
    <GridItem>
      <WhatCookbook learnMoreRef={learnMoreRef} />
    </GridItem>
    <Divider />
    <GridItem>

    </GridItem>
    </>
  );
}

export default Home;
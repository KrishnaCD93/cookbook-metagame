import { Box, Button, Divider, GridItem, Image, Spinner, Text, useColorModeValue, useDisclosure, VStack } from '@chakra-ui/react';
import React, { useRef } from 'react';

import wordmark from '../assets/wordmark.svg';
import altWordmark from '../assets/alt-wordmark.svg';
import CreateRequest from '../components/CreateRequest';
import WhatCookbook from '../components/WhatCookbook';
import CreateRecipeButton from '../components/CreateRecipeButton';
import NHostAuth from '../components/auth-container/NHostAuth';
import { useAuthenticationStatus } from '@nhost/react';

const Home = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { isOpen: requestRecipeIsOpen, onOpen: requestRecipeOnOpen, onClose: requestRecipeOnClose } = useDisclosure();
  const learnMoreRef = useRef(null);
  const learnMoreScroll = () => learnMoreRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const wordmarkLogo = useColorModeValue(wordmark, altWordmark);

  if (isLoading) return <Spinner />

  return ( 
    <>
    <GridItem>
      <VStack mb={4}>
        <Box>
          <Image src={wordmarkLogo} alt="Cookbook Social" h='25vh' borderRadius={8} />
          <Text>A community for foodies to contribute tastes and discover recipes.</Text>
          <Text>Welcome to the social metagame!</Text>
        </Box>
        {!isAuthenticated && <NHostAuth />}
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
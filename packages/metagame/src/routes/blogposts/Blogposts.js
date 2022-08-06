import React from 'react';
import { Box, SimpleGrid, Heading, Text, Image, HStack } from '@chakra-ui/react';
import logo from '../../assets/logo.png';

const Blogposts = () => {
  return ( 
    <Box>
      <Heading as="h1" mb={4}>Blogposts</Heading>
      <SimpleGrid columns={2} spacing={4}>
        <Box _hover={{ cursor: 'pointer' }} border='1px solid' borderColor='gray.200' borderRadius='8px' p={4}
        onClick={() => window.open('https://mirror.xyz/0x067a679B1b56A3CA58E2F4Eb77a157E61c95e9e4/YNsehRAs5Yxq77jD3gC2Sg6gB3k0VjI8eobZZrZU144')}>
          <Heading as="h2" size="lg">Cookbook: A Social Recipe Network</Heading>
          <HStack>
            <Image boxSize='150px' src={logo} alt="Cookbook Social" />
            <Text fontSize='md'>
              Cookbook.Social is a social network for foodies to contribute tastes and discover recipes.
              Read about the mission, vision, and values of the Cookbook.Social community.
            </Text>
          </HStack>
        </Box>
        <Box _hover={{ cursor: 'pointer' }} border='1px solid' borderColor='gray.200' borderRadius='8px' p={4}
        onClick={() => window.open('https://mirror.xyz/0x067a679B1b56A3CA58E2F4Eb77a157E61c95e9e4/6LYG9EXny0TGsj8w8kb6F8iqcXV8Tz6ZYTPSHHyWsMo')}>
          <Heading as="h2" size="lg">The Cooking Metagame</Heading>
          <HStack>
            <Image boxSize='150px' src={logo} alt="Cookbook Social" />
            <Text fontSize='md'>
            A metagame is a game we play to record and share our attempts at self-improvement in our daily lives. 
            The cooking metagame is designed to get us to try out new cooking styles from around the world and diversify our palettes. 
            Read about the metagame design and concept.
            </Text>
          </HStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default Blogposts;
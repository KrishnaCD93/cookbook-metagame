import React from 'react';
import { Box, Grid, Heading, Text, Image, HStack, GridItem } from '@chakra-ui/react';
import logo from '../../assets/logo.png';

const Blogposts = () => {
  return ( 
    <>
    <Heading>Blogposts</Heading>
    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
      <GridItem>
        <Box _hover={{ cursor: 'pointer' }} border='1px solid' borderColor='gray.200' borderRadius='8px' p={4}
        onClick={() => window.open('https://mirror.xyz/0x067a679B1b56A3CA58E2F4Eb77a157E61c95e9e4/YNsehRAs5Yxq77jD3gC2Sg6gB3k0VjI8eobZZrZU144')}>
          <Text as='b'>Cookbook: A Social Recipe Network</Text>
          <HStack>
            <Image boxSize='50px' src={logo} alt="Cookbook Social" />
            <Text fontSize='md' overflow='hidden' textOverflow='ellipsis'>
              Read about the mission, vision, and values of the Cookbook community.
            </Text>
          </HStack>
        </Box>
      </GridItem>
      <GridItem>
        <Box _hover={{ cursor: 'pointer' }} border='1px solid' borderColor='gray.200' borderRadius='8px' p={4}
        onClick={() => window.open('https://mirror.xyz/0x067a679B1b56A3CA58E2F4Eb77a157E61c95e9e4/yqUUlt2aqO8rTI4Kv8EOT2oGqTXZWrZ-SpQ2ZVQTEJQ')}>
          <Text as='b'>Building, Shipping, And Iterating On A Cookbook</Text>
          <HStack>
            <Image boxSize='50px' src={logo} alt="Cookbook Social" />
            <Text fontSize='md'>
              An update on my Cookbook Social metaverse experiment, the progress, the feedback, and the future.
            </Text>
          </HStack>
        </Box>
      </GridItem>
    </Grid>
    </>
  );
}

export default Blogposts;
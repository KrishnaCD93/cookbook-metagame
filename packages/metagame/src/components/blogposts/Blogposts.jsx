import React from 'react';
import { Box, Grid, Heading, Text, HStack, GridItem, Image } from '@chakra-ui/react';
import cookbookLogo from '../../assets/blogs/cookbook-logo.jpeg';
import building from '../../assets/blogs/building.jpeg';
import metaverse from '../../assets/blogs/into-the-metaverse.jpeg';

const Blogposts = () => {
  return ( 
    <>
    <Heading>Blogposts</Heading>
    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
      <GridItem>
        <Box _hover={{ cursor: 'pointer' }} border='1px solid' borderColor='gray.200' borderRadius='8px' p={4}
        onClick={() => window.open('https://mirror.xyz/0x067a679B1b56A3CA58E2F4Eb77a157E61c95e9e4/YNsehRAs5Yxq77jD3gC2Sg6gB3k0VjI8eobZZrZU144')}>
          <Image src={cookbookLogo} borderRadius='4px' />
          <Text as='b'>Cookbook: A Social Recipe Network</Text>
          <HStack>
            <Text fontSize='md' overflow='hidden' textOverflow='ellipsis'>
              Read about the mission, vision, and values of the Cookbook community.
            </Text>
          </HStack>
        </Box>
      </GridItem>
      <GridItem>
        <Box _hover={{ cursor: 'pointer' }} border='1px solid' borderColor='gray.200' borderRadius='8px' p={4}
        onClick={() => window.open('https://mirror.xyz/0x067a679B1b56A3CA58E2F4Eb77a157E61c95e9e4/yqUUlt2aqO8rTI4Kv8EOT2oGqTXZWrZ-SpQ2ZVQTEJQ')}>
          <Image src={building} borderRadius='4px' />
          <Text as='b'>Building, Shipping, And Iterating On A Cookbook</Text>
          <HStack>
            <Text fontSize='md'>
              An update on my Cookbook Social metaverse experiment, the progress, the feedback, and the future.
            </Text>
          </HStack>
        </Box>
      </GridItem>
      <GridItem>
        <Box _hover={{ cursor: 'pointer' }} border='1px solid' borderColor='gray.200' borderRadius='8px' p={4}
        onClick={() => window.open('https://mirror.xyz/0x067a679B1b56A3CA58E2F4Eb77a157E61c95e9e4/eJZKJKIXNv1R4tMeWy-sqfF5mhwvJKX9VwXPvkw7bkM')}>
          <Image src={metaverse} borderRadius='4px' />
          <Text as='b'>Metaverse, A Digitally Augmented Reality</Text>
          <HStack>
            <Text fontSize='md'>
              A brief introduction to the metaverse, what it is, and how it is different from the internet.
            </Text>
          </HStack>
        </Box>
      </GridItem>
    </Grid>
    </>
  );
}

export default Blogposts;
import { Box, Container, Divider, Flex, HStack, Spacer, VStack, Text, SimpleGrid, Grid, GridItem } from '@chakra-ui/react';
import React from 'react';

const WhatCookbook = (props) => {
  return(
    <Container centerContent ref={props.learnMoreRef}>
      <Flex alignItems='baseline' margin='30px'>
        <VStack spacing={4}>
        <HStack>
          <SimpleGrid columns={{sm: 1, md: 2}}>
            <Box as='flex' margin={'25px'}>
              <Text fontSize={'4xl'} justifyContent='center' alignItems='center'>Get Cooking</Text>
            </Box>
            <Box>
              <Text fontSize='md'>
                Cookbook is a social network for home chefs who want to share their recipes.<br />
                We help you get cooking in 3 easy steps:<br />
                1. Find recipes<br />
                2. Make dishes<br />
                3. Create alterations<br />
                Use your digital cookbook to enable social interactions with your pantry.
              </Text>
            </Box>
          </SimpleGrid>
        </HStack>
      <Spacer />
        <Box align={'center'}>
          <Text
            bgGradient='linear(to-tl, #3c4751, #c9b68e, #3c4751)'
            bgClip='text'
            textShadow={'0 1px 0 rgba(0, 0, 0, 0.1)'}
            fontSize='5xl'>
            User generated content<br />delivering decentralized taste
            </Text>
        </Box>
      <Spacer />
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
        <GridItem>
          <VStack>
            <Text fontSize='4xl'>Create</Text>
            <Divider />
            <Text fontSize='md' align={'center'}>
              Use our visual builder to build beautiful recipe collections.<br />
              Simplify complexity and capture nuance.
            </Text>
          </VStack>
        </GridItem>
        <GridItem>
          <VStack>
            <Text fontSize='4xl'>Play</Text>
            <Divider />
            <Text fontSize='md' align={'center'}>
              Set goals and earn achievements.<br />
              Track your progress on leaderboards.
            </Text>
          </VStack>
        </GridItem>
        <GridItem>
          <VStack>
            <Text fontSize='4xl'>Discover</Text>
            <Divider />
            <Text fontSize='md' align={'center'}>
              Discover new recipes and different cooking styles.<br />
              Add your unique taste to the marketplace of ideas.
            </Text>
          </VStack>
        </GridItem>
        <GridItem>
          <VStack>
            <Text fontSize='4xl'>Trade</Text>
            <Divider />
            <Text fontSize='md' align={'center'}>
              Earn tokens by creating recipes and sharing cookbooks.<br />
              Trade your ideas and skills learned in the kitchen by filling out recipe requests. 
            </Text>
          </VStack>
        </GridItem>
      </Grid>
      </VStack>
      </Flex>
    </Container>
  )
}

export default WhatCookbook;
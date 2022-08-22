import { Box, Divider, Heading } from '@chakra-ui/react';
import React from 'react';
import Blogposts from '../components/blogposts/Blogposts';
import TheMetagame from '../components/blogposts/TheMetagame';

const About = () => {
  return (
    <Box>
      <Heading as="h1" mb={4}>About</Heading>
      <Divider />
      <TheMetagame />
      <br />
      <Blogposts />
    </Box>
  );
}

export default About;
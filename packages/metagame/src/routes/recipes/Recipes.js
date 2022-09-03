import { Box, Heading } from '@chakra-ui/react';
import React from 'react'
import { Outlet } from 'react-router-dom';

const Recipes = () => {
  return ( 
    <Box>
      <Heading>Recipes</Heading>
      <Outlet />
    </Box>
  );
}

export default Recipes;
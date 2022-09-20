import { gql, useQuery } from '@apollo/client';
import { Button, useDisclosure } from '@chakra-ui/react';
import React from 'react'
import CreateRecipe from './CreateRecipe';

export const GET_INGREDIENTS = gql`
  query GetIngredients {
    ingredients {
      _id
      name
    }
  }
`;

const CreateRecipeButton = () => {
  const { isOpen: recipeIsOpen, onOpen: recipeOnOpen, onClose: recipeOnClose } = useDisclosure();
  const { error, client } = useQuery(GET_INGREDIENTS);
  if (error) console.log(error);
  return ( 
    <>
    <Button 
      onMouseOver={() => client.query({ query: GET_INGREDIENTS })}
      onClick={recipeOnOpen}>Add Recipe</Button>
    <CreateRecipe isOpen={recipeIsOpen} onClose={recipeOnClose} />
    </>
  );
}

export default CreateRecipeButton;
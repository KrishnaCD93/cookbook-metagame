import React from 'react';
import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { useAccount } from 'wagmi';

const GET_USER_TASTES = gql`
  query Query($userId: String!) {
    tasteProfilesByUserID(userID: $userId) {
      _id
      salt
      sweet
      sour
      spice
      bitter
      umami
    }
  }
`

const GET_USER_RECIPES = gql`
  query Query($userId: String!) {
    recipesByUserID(userID: $userId) {
      _id
      name
      imageCid
      description
      ingredientIDs
      stepIDs
      tasteProfileID
      qualityTags
      equipment
      signature
      createdAt
    }
  }
`

const ViewCookbook = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const [userTastes, { data: tasteData, loading: tasteLoading, error: tasteError }] = useLazyQuery(GET_USER_TASTES, { variables: { userId: `${address}` } });
  const { data: recipeData, loading: recipeLoading, error: recipeError } = useQuery(GET_USER_RECIPES, { variables: { userId: `${address}` } });

  if (tasteLoading || recipeLoading) {
    return <div>Loading...</div>;
  }

  if (tasteError) console.log('taste error', tasteError);
  if (recipeError) console.log('recipe error', recipeError);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Your Cookbook</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text as='b' fontSize='lg'>Recipes</Text>
        {recipeData && recipeData.recipesByUserID.map(recipe => (
          <Box key={recipe._id}>
            <Text>{recipe.name}</Text>
            <Text fontSize='sm'>{recipe.description}</Text>
          </Box>
        ))}
        <Text as='b' fontSize='lg'>Taste Profiles</Text>
        {tasteData && tasteData.tasteProfilesByUserID.map(taste => (
          <Box key={taste._id}>
            <Text>{taste.salt}</Text>
            <Text>{taste.sweet}</Text>
            <Text>{taste.sour}</Text>
            <Text>{taste.bitter}</Text>
            <Text>{taste.spice}</Text>
            <Text>{taste.umami}</Text>
          </Box>
        ))}
      </ModalBody>
    </ModalContent>
    </Modal>
  );
}

export default ViewCookbook;
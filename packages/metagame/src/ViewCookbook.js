import React from 'react';
import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { useAccount } from 'wagmi';

const GET_USER_INGREDIENTS = gql`
  query Query($userId: String!) {
    ingredientsByUserID(userID: $userId) {
      _id
      name
      quantity
      comments
      imageCid
    }
  }
`;

const GET_USER_STEPS = gql`
  query Query($userId: String!) {
    stepsByUserID(userID: $userId) {
      _id
      stepName
      action
      trigger
      comments
      actionImageCid
      triggerImageCid
    }
  }
`;

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
  const [getIngredients, { data: ingredientData, loading: ingredientLoading, error: ingredientError }] = useLazyQuery(GET_USER_INGREDIENTS, { variables: { userId: address } });
  const [getSteps, { data: stepData, loading: stepLoading, error: stepError }] = useLazyQuery(GET_USER_STEPS, { variables: { userId: address } });
  const [getTastes, { data: tasteData, loading: tasteLoading, error: tasteError }] = useLazyQuery(GET_USER_TASTES, { variables: { userId: address } });
  const { data: recipeData, loading: recipeLoading, error: recipeError } = useQuery(GET_USER_RECIPES, { variables: { userId: address } });

  // async function handleClick(recipe) {
  //   await getIngredients();
  //   await getSteps();
  //   await getTastes();
  // }
  if (ingredientLoading || stepLoading || tasteLoading || recipeLoading) {
    return <div>Loading...</div>;
  }

  if (ingredientError) console.log('ingredient error', ingredientError);
  if (stepError) console.log('step error', stepError);
  if (tasteError) console.log('taste error', tasteError);
  if (recipeError) console.log('recipe error', recipeError);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Your Cookbook</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text fontSize='lg'>Recipes</Text>
        {recipeData && recipeData.recipesByUserID.map(recipe => (
          <Box key={recipe._id}>
            <Text>{recipe.name}</Text>
            <Text fontSize='sm'>{recipe.description}</Text>
          </Box>
        ))}
        <Text>Ingredients</Text>
        {ingredientData && ingredientData.ingredientsByUserID.map(ingredient => (
          <Box key={ingredient._id}>
            <Text>{ingredient.name}</Text>
          </Box>
        ))}
        <Text>Steps</Text>
        {stepData && stepData.stepsByUserID.map(step => (
          <Box key={step._id}>
            <Text>{step.stepName}</Text>
          </Box>
        ))}
        <Text>Taste Profiles</Text>
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
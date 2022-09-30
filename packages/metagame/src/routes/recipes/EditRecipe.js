import { gql, useMutation } from '@apollo/client';
import { Box, Button, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useAccount, useSignMessage } from 'wagmi';
import useGetRecipeData from '../../hooks/useGetRecipeData';

const UPDATE_RECIPE = gql`
  mutation Mutation($updateRecipeID: ID!, $userID: String!, $signatureMessage: String!, $name: String, $imageCid: String, $description: String, $ingredientIDs: [ID], $stepIDs: [ID], $tasteProfileID: ID, $qualityTags: String, $equipment: String) {
  updateRecipe(id: $updateRecipeID, userID: $userID, signatureMessage: $signatureMessage, name: $name, imageCid: $imageCid, description: $description, ingredientIDs: $ingredientIDs, stepIDs: $stepIDs, tasteProfileID: $tasteProfileID, qualityTags: $qualityTags, equipment: $equipment) {
    success
    message
    recipeID
  }
}
`

const DELETE_RECIPE = gql`
  mutation Mutation($deleteRecipeID: ID!, $signatureMessage: String!) {
    deleteRecipe(id: $deleteRecipeID, signatureMessage: $signatureMessage) {
      success
      message
      recipeID
    }
  }
`

const EditRecipe = () => {
  const { recipeID } = useParams();
  const [updateRecipe] = useMutation(UPDATE_RECIPE);
  const [deleteRecipe] = useMutation(DELETE_RECIPE);
  const { recipeData, ingredients, steps, tasteProfile, loading, error } = useGetRecipeData(recipeID);
  const { isConnected, address: accountInfo } = useAccount();
  const { signMessageAsync } = useSignMessage();

  if (error) console.log('recipe error', error);

  if (loading) return <Spinner />;

  const handleDelete = async () => {
    if (isConnected) {
      const date = new Date().toISOString();
      const signatureMessage = `Delete recipe ${recipeID} on ${date} by ${accountInfo}`;
      console.log(signatureMessage)
      const signData = await signMessageAsync({ message: signatureMessage });
      localStorage.setItem('signature', signData);
      await deleteRecipe({
        variables: {
          deleteRecipeID: recipeID,
          signatureMessage: signatureMessage,
        }
      })
    }
  }

  if (recipeData) {
  return (  
    <Box>
      Edit Recipe
      <Text>{recipeID}</Text>
      <Box>{recipeData.name}</Box>
      <Button onClick={handleDelete}>Delete Recipe</Button>
    </Box>
  );
  }
}

export default EditRecipe;
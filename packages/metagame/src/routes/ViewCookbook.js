import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { gql, useLazyQuery } from '@apollo/client';
import { useAccount, useQuery } from 'wagmi';

const GET_RECIPE_TASTE = gql`
  query Query($id: ID!) {
    tasteProfileByID(id: $id) {
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
  query Query($userID: String!) {
    recipesByUserID(userID: $userID) {
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

const ViewCookbook = () => {
  const { address } = useAccount();
  const userID = useRef('0x0');
  const { data: recipeData, loading: recipeLoading, error: recipeError } = useQuery(GET_USER_RECIPES, { variables: { userID: `${userID.current}` }});

  useEffect(() => {
    userID.current = address || '0x0';
  }, [address]);

  const recipesMemo = useMemo(() => {
  if (recipeData) {
    return recipeData.recipesByUserID;
  }
  }, [recipeData]);

  if (recipeLoading) {
    return <div>Loading...</div>;
  }

  if (recipeError) console.log('recipe error', recipeError);
  return (
    <Box>
      <Text>{userID.current}'s Cookbook</Text>
      <Text as='b' fontSize='lg'>Recipes</Text>
      {recipesMemo && recipesMemo.map(recipe => (
        <Box key={recipe._id} _hover={{ bg: 'gray.200', cursor: 'pointer' }}>
          <ViewTasteProfile recipe={recipe} />
        </Box>
      ))}
    </Box>
  );
}

const ViewTasteProfile = (recipe) => {
  const [getTaste, { data, loading, error }] = useLazyQuery(GET_RECIPE_TASTE);
  const [tasteProfileID, setTasteProfileID] = useState('')
  const [tasteInfo, setTasteInfo] = useState({})

  const getTasteProfile = async () => {
    setTasteProfileID(recipe.tasteProfileID)
    await getTaste({ variables: { id: `${tasteProfileID}` } })
    if (data) setTasteInfo({
      salt: data.tasteProfileByID.salt,
      sweet: data.tasteProfileByID.sweet,
      sour: data.tasteProfileByID.sour,
      bitter: data.tasteProfileByID.bitter,
      spice: data.tasteProfileByID.spice,
      umami: data.tasteProfileByID.umami
    })
  }

  if (loading) return <div>Loading...</div>;
  if (error) console.log('error', error);

  return (
    <Box onClick={getTasteProfile}>
      <Text>{recipe.name}</Text>
      <Text fontSize='sm'>{recipe.description}</Text>
      <Text>Taste Profile</Text>
      {data && tasteInfo && (
        <Box>
          <Text>Salt: {tasteInfo.salt}</Text>
          <Text>Sweet: {tasteInfo.sweet}</Text>
          <Text>Sour: {tasteInfo.sour}</Text>
          <Text>Bitter: {tasteInfo.bitter}</Text>
          <Text>Spice: {tasteInfo.spice}</Text>
          <Text>Umami: {tasteInfo.umami}</Text>
        </Box>
      )}
    </Box>
  );
}

export default ViewCookbook;
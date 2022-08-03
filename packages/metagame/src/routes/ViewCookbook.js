import React, { useEffect, useMemo, useState } from 'react';
import { Box, Divider, Grid, GridItem, Skeleton, Text } from '@chakra-ui/react';
import { gql, useQuery } from '@apollo/client';
import { useAccount, useEnsName } from 'wagmi';
import useApolloMutations from '../hooks/useApolloMutations';

export const GET_USER_COOKBOOK = gql`
  query Query($userID: String!) {
    cookbookByUserID(userID: $userID) {
      description
      recipes {
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
      ingredients {
        _id
        name
        quantity
        comments
        imageCid
      }
      steps {
        _id
        stepName
        action
        trigger
        comments
        actionImageCid
        triggerImageCid
      }
      tasteProfiles {
        _id
        salt
        sweet
        sour
        bitter
        spice
        umami
      }
      chefsMetas {
        _id
        recipeID
        comments
        specialtyTags
      }
      externalRecipes {
        _id
        name
        recipeUrl
      }
      user {
        userID
        name
        image
        email
      }
    }
  }
`;

const ViewCookbook = () => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [userID, setUserID] = useState('');
  const [uploadExternalRecipe, uploadChefsMeta] = useApolloMutations();
  const { data: cookbookData, loading: cookbookLoading, error: cookbookError } = useQuery(GET_USER_COOKBOOK, { variables: { userID: `${userID}` }});

  useEffect(() => {
    setUserID(address ? address : '0x0');
  }, [address]);

  const cookbookMemo = useMemo(() => {
    if (cookbookData) {
      return cookbookData.cookbookByUserID;
    }
  }, [cookbookData]);

  if (cookbookError) console.log('cookbook error', cookbookError);

  return (
    <Box>
      <Text>{ensName ? ensName : userID}'s Cookbook</Text>
      <Skeleton isLoaded={cookbookLoading ? false : true}>
      {cookbookMemo && 
      <>
        <Box>
          {cookbookMemo.description && <Text>{cookbookMemo.description}</Text>}
          {cookbookMemo.recipes && <Text>{cookbookMemo.recipes.length} recipe(s)</Text>}
          {cookbookMemo.ingredients && <Text>{cookbookMemo.ingredients.length} ingredient(s)</Text>}
          {cookbookMemo.steps && <Text>{cookbookMemo.steps.length} step(s)</Text>}
          {cookbookMemo.tasteProfiles && <Text>{cookbookMemo.tasteProfiles.length} taste profile(s)</Text>}
          {cookbookMemo.chefsMetas && <Text>{cookbookMemo.chefsMetas.length} chefs meta(s)</Text>}
          {cookbookMemo.externalRecipes && <Text>{cookbookMemo.externalRecipes.length} external recipe(s)</Text>}
        </Box>
        <Divider />
        {/* Show recipes in a grid that users can click that shows the recipe's chefs meta if clicked */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          {cookbookMemo.recipes && cookbookMemo.recipes.map((recipe, index) => (
            <GridItem key={index} _hover={{ cursor: 'pointer' }}>
              <RecipeCard cookbook={cookbookMemo} recipe={recipe} uploadExternalRecipe={uploadExternalRecipe} uploadChefsMeta={uploadChefsMeta} />
            </GridItem>
          ))}
        </Grid>
        </>
      }
      </Skeleton>
    </Box>
  );
}

// This is the component that is rendered for each recipe in the grid to show the chefs meta from the cookbook
const RecipeCard = ({ recipe, cookbook, uploadExternalRecipe, uploadChefsMeta }) => {
  const [recipeChefsMeta, setRecipeChefsMeta] = useState(null);

  const handleClick = () => {
    if (cookbook.chefsMetas && cookbook.chefsMetas.find(chefsMeta => chefsMeta.recipeID === recipe._id)) {
      setRecipeChefsMeta(cookbook.chefsMetas.filter(meta => meta.recipeID === recipe._id));
    }
  }

  return (
    <Box onClick={handleClick}>
      <Text>{recipe.name}</Text>
      {recipeChefsMeta && recipeChefsMeta.map((meta, index) => (
        <Box key={index}>
          <Text>{meta.comments}</Text>
          <Text>{meta.specialtyTags}</Text>
        </Box>
      ))}
    </Box>
  );
}


export default ViewCookbook;
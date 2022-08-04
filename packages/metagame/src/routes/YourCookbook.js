import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Divider, Grid, GridItem, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Skeleton, Text, Textarea, useDisclosure } from '@chakra-ui/react';
import { gql, useQuery } from '@apollo/client';
import { useAccount, useEnsName } from 'wagmi';
import useApolloMutations from '../hooks/useApolloMutations';
import { FaComment } from 'react-icons/fa';
import CreateRecipe from '../CreateRecipe';

export const GET_USER_COOKBOOK = gql`
  query UserCookbook($userID: String!) {
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
  const { data: cookbookData, loading: cookbookLoading, error: cookbookError, refetch } = useQuery(GET_USER_COOKBOOK, 
    { variables: { userID: `${userID}` }});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: externalIsOpen, onOpen: externalOnOpen, onClose: externalOnClose } = useDisclosure();
  const [showRecipes, setShowRecipes] = useState(true);
  const [showExternalRecipes, setShowExternalRecipes] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [showTasteProfiles, setShowTasteProfiles] = useState(false);

  useEffect(() => {
    setUserID(address ? address : '0x0');
  }, [address]);
  
  const cookbookMemo = useMemo(() => {
    if (cookbookData) {
      refetch({ userID: userID });
      return cookbookData.cookbookByUserID;
    }
  }, [cookbookData, refetch, userID]);

  if (cookbookError) console.log('cookbook error', cookbookError);

  return (
    <Box>
      <Text>{ensName ? ensName : userID}'s Cookbook</Text>
      <Skeleton isLoaded={cookbookLoading ? false : true}>
        {cookbookMemo && 
        <Grid gap={4} templateColumns='repeat(2, 1fr)'>
          <GridItem>
            <Box>
              {cookbookMemo.description && <Text>{cookbookMemo.description}</Text>}
              {cookbookMemo.recipes && <Text onClick={() => setShowRecipes(!showRecipes)} _hover={{ cursor: 'pointer' }}
              >{cookbookMemo.recipes.length} recipe(s)</Text>}
              {cookbookMemo.ingredients && <Text onClick={() => setShowIngredients(!showIngredients)} _hover={{ cursor: 'pointer' }}
              >{cookbookMemo.ingredients.length} ingredient(s)</Text>}
              {cookbookMemo.steps && <Text onClick={() => setShowSteps(!showSteps)} _hover={{ cursor: 'pointer' }}
              >{cookbookMemo.steps.length} step(s)</Text>}
              {cookbookMemo.tasteProfiles && <Text onClick={() => setShowTasteProfiles(!showTasteProfiles)} _hover={{ cursor: 'pointer' }}
              >{cookbookMemo.tasteProfiles.length} taste profile(s)</Text>}
              {cookbookMemo.chefsMetas && <Text>{cookbookMemo.chefsMetas.length} chefs meta(s)</Text>}
              {cookbookMemo.externalRecipes && <Text onClick={() => setShowExternalRecipes(!showExternalRecipes)} _hover={{ cursor: 'pointer' }}
              >{cookbookMemo.externalRecipes.length} external recipe(s)</Text>}
            </Box>
          </GridItem>
          <GridItem>
            {showRecipes && !showExternalRecipes && !showIngredients && !showSteps && !showTasteProfiles &&
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              {cookbookMemo.recipes && cookbookMemo.recipes.map((recipe, index) => (
                <GridItem key={index} _hover={{ cursor: 'pointer' }}>
                  <RecipeInfo cookbook={cookbookMemo} recipe={recipe} uploadChefsMeta={uploadChefsMeta} />
                </GridItem>
              ))}
            </Grid>}
            {showExternalRecipes && !showRecipes && !showIngredients && !showSteps && !showTasteProfiles &&
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              {cookbookMemo.externalRecipes && cookbookMemo.externalRecipes.map((recipe, index) => (
                <GridItem key={index} _hover={{ cursor: 'pointer' }}>
                  <RecipeInfo recipe={recipe} cookbook={cookbookMemo} uploadExternalRecipe={uploadExternalRecipe} />
                </GridItem>
              ))}
            </Grid>}
            {showIngredients && !showRecipes && !showExternalRecipes && !showSteps && !showTasteProfiles &&
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              {cookbookMemo.ingredients && cookbookMemo.ingredients.map((ingredient, index) => (
                <GridItem key={index} _hover={{ cursor: 'pointer' }}>
                  {ingredient.name && <Text>{ingredient.name}</Text>}
                </GridItem>
              ))}
            </Grid>}
            {showSteps && !showRecipes && !showExternalRecipes && !showIngredients && !showTasteProfiles &&
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              {cookbookMemo.steps && cookbookMemo.steps.map((step, index) => (
                <GridItem key={index} _hover={{ cursor: 'pointer' }}>
                  {step.stepName && <Text>{step.stepName}</Text>}
                </GridItem>
              ))}
            </Grid>}
            {showTasteProfiles && !showRecipes && !showExternalRecipes && !showIngredients && !showSteps &&
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              {cookbookMemo.tasteProfiles && cookbookMemo.tasteProfiles.map((taste, index) => (
                <GridItem key={index} _hover={{ cursor: 'pointer' }}>
                  {taste.salt && <Text>{taste.salt}</Text>}
                  {taste.sweet && <Text>{taste.sweet}</Text>}
                  {taste.sour && <Text>{taste.sour}</Text>}
                  {taste.bitter && <Text>{taste.bitter}</Text>}
                  {taste.spicy && <Text>{taste.spicy}</Text>}
                  {taste.umami && <Text>{taste.umami}</Text>}
                </GridItem>
              ))}
            </Grid>}
          </GridItem>
        </Grid>
        }
      </Skeleton>
      <Button m={4} p={4} onClick={onOpen}>Create Recipe</Button>
      <CreateRecipe isOpen={isOpen} onClose={onClose} />
      <Divider />
      <Text>Or</Text>
      <Divider />
      <Button m={4} p={4} onClick={externalOnOpen}>Create External Recipe</Button>
      <AddExternalRecipe uploadExternalRecipe={uploadExternalRecipe} isOpen={externalIsOpen} onClose={externalOnClose} />
    </Box>
  );
}

// This is the component that is rendered for each recipe in the grid to show the chefs meta
const RecipeInfo = ({ recipe, cookbook, uploadChefsMeta }) => {
  const [recipeChefsMeta, setRecipeChefsMeta] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleClick = () => {
    if (cookbook.chefsMetas && cookbook.chefsMetas.find(chefsMeta => chefsMeta.recipeID === recipe._id)) {
      setRecipeChefsMeta(cookbook.chefsMetas.filter(meta => meta.recipeID === recipe._id));
    }
  }

  return (
    <Box onClick={handleClick}>
      <Text>{recipe.name}<IconButton size='sm' ml={2} icon={<FaComment />} onClick={() => setShowForm(!showForm)} /></Text>
      {recipeChefsMeta && recipeChefsMeta.map((meta, index) => (
        <Box key={index}>
          <Text>{meta.comments}</Text>
          <Text>{meta.specialtyTags}</Text>
        </Box>
      ))}
    {showForm && <AddChefsMeta recipe={recipe} uploadChefsMeta={uploadChefsMeta}/>}
    </Box>
  );
}

const AddChefsMeta = ({ recipe, uploadChefsMeta }) => {
  const comments = [];
  const specialtyTags = [];
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    setUploading(true);
    const chefsMeta = { recipeID: recipe._id, comments, specialtyTags };
    console.log('chefs meta', chefsMeta);
    await uploadChefsMeta(chefsMeta);
    setUploading(false);
  }

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Text>Comments</Text>
        <Textarea type="text" value={comments} onChange={e => comments.push(e.target.value)} />
        <Input type="text" value={specialtyTags} onChange={e => specialtyTags.push(e.target.value)} />
        <Button type="submit" isDisabled={uploading}>Submit</Button>
      </form>
    </Box>
  );
}

const AddExternalRecipe = ({ uploadExternalRecipe, isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    setUploading(true);
    const externalRecipe = { name, recipeUrl };
    console.log('external recipe', externalRecipe);
    await uploadExternalRecipe(externalRecipe);
    setName('');
    setRecipeUrl('');
    setUploading(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add External Recipe</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Text>Name</Text>
            <Input type="text" value={name} onChange={e => setName(e.target.value)} />
            <Text>Recipe URL</Text>
            <Input type="text" value={recipeUrl} onChange={e => setRecipeUrl(e.target.value)} />
            <Button type="submit" isDisabled={uploading}>Submit</Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}



export default ViewCookbook;
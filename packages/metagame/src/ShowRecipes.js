import { Badge, Box, Button, Divider, Grid, GridItem, Image, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';

import { gql, useLazyQuery, useQuery } from '@apollo/client';

const GET_RECIPE_WITH_DATA = gql`
  query RecipeWithData($recipeID: ID!) {
    recipeWithData(recipeID: $recipeID) {
      recipe {
        _id
        name
        imageCid
        description
        ingredientIDs
        stepIDs
        tasteProfileID
        metaQualityTags
        equipment
        userID
        signature
        createdAt
      }
      ingredients {
        _id
        name
        quantity
        comments
        imageCid
        userID
      }
      steps {
        _id
        stepName
        action
        trigger
        comments
        actionImageCid
        triggerImageCid
        userID
      }
      tasteProfile {
        _id
        salt
        sweet
        sour
        bitter
        spice
        umami
        userID
      }
    }
  }
`;

const GET_RECIPES = gql`
  query Query {
    recipes {
      _id
      name
      imageCid
      description
      metaQualityTags
      equipment
      userID
      signature
      createdAt
    }
  }
`;

const ShowRecipes = ({ accountInfo }) => {
  const { data, loading, error } = useQuery(GET_RECIPES);
  const [recipes, setRecipes] = useState([]);
  
  // Ensure all recipes are loaded and memoize recipe
  const recipesMemo = useMemo(() => {
    if (recipes && recipes.length > 0) {
      return recipes
    }
  }, [recipes]);
  
  
  useEffect(() => {
    if (data && data.recipes && data.recipes.length > 0) {
      setRecipes(data.recipes);
    }
  }, [data]);
  
  
  if (loading) return <div>Loading Recipes...</div>;
  
  if (error) console.log('recipe error', error)
  
  return (
    <>
    {accountInfo ?
    <> 
      <Text fontSize="large">Recipes</Text>
      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
        {recipesMemo && recipesMemo.map((recipe, index) => (
          <GridItem key={index}>
              <RecipeCard recipe={recipe} />
          </GridItem>
        ))}
      </Grid>
    </>
      : <Text>Connect polygon account to view recipes</Text>
    }
    </>
  );
}

const RecipeCard = ({ recipe }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [recipeID, setRecipeID] = useState('');
  const [getRecipeWithData, { data: recipeWithData, loading: recipeWithLoading, error: recipeWithError }] = useLazyQuery(GET_RECIPE_WITH_DATA, { 
    variables: { recipeID: `${recipeID}` } 
  });
  const [recipeData, setRecipeData] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [tasteProfile, setTasteProfile] = useState(null);

  useEffect(() => {
    if (isOpen) {
    const getRecipe = async () => {
        setRecipeID(recipe._id);
        await getRecipeWithData();
        if (recipeWithData) {
          console.log('data', recipeWithData);
          setRecipeData(recipeWithData.recipeWithData.recipe);
          setIngredients(recipeWithData.recipeWithData.ingredients);
          setSteps(recipeWithData.recipeWithData.steps);
          setTasteProfile(recipeWithData.recipeWithData.tasteProfile);
        }
      }
      getRecipe();
    }
  }, [isOpen, getRecipeWithData, recipe, recipeWithData]);
  const showRecipe = (recipe) => {
    setRecipeID(recipe._id);
    onOpen();
  } 
  if (recipeWithLoading) return <div>Loading Recipe...</div>;
  if (recipeWithError) console.log('recipe error', recipeWithError)
  
  return (
    <>
    <Box boxShadow='lg' borderRadius={4} onClick={() => showRecipe(recipe)}>
      <VStack spacing={4} align="center">
        {recipe.imageCid && <Image src={`https://ipfs.io/ipfs/${recipe.imageCid}`} alt={recipe.name} />}
        <Text fontSize="large">{recipe.name}</Text>
        {recipe.description && <Text fontSize='md'>{recipe.description}</Text>}
        {recipe.metaQualityTags && recipe.metaQualityTags.split(',').map((tag, index) => (
          <Badge key={index} color='teal' variant='subtle'>{tag}</Badge>
        ))}
        {recipe.signature && <Badge color='teal' variant='subtle'>Signed</Badge>}
        <Button variant='ghost' w='100%'>View Recipe</Button>
      </VStack>
    </Box>
    {recipeData && ingredients && steps && tasteProfile && 
      <Recipe isOpen={isOpen} onClose={onClose} recipeData={recipeData} ingredients={ingredients} steps={steps} tasteProfile={tasteProfile} />
    }
    </>
  );
}

const Recipe = (props) => {
  const { isOpen, onClose, recipeData, ingredients, steps, tasteProfile } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {recipeData && recipeData.name}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="center" divider={<Divider />}>
            {recipeData && recipeData.imageCid && <Image src={`https://ipfs.io/ipfs/${recipeData.imageCid}`} alt={recipeData.name} />}
            {recipeData && recipeData.description && <Text fontSize="large">{recipeData.description}</Text>}
            {ingredients && <>
              <Text as='b' fontSize="large">Ingredients</Text>
              <Ingredients ingredients={ingredients} />
            </>}
            {steps && <>
              <Text as='b' fontSize="large">Steps</Text>
              <Steps steps={steps} />
            </>}
            {tasteProfile && <TasteProfile tasteProfile={tasteProfile} />}
            {recipeData && recipeData.equipment && <Text fontSize="md">Equipment: {recipeData.equipment}</Text>}
            {recipeData && recipeData.metaQualityTags && <Text fontSize="md">Tags: {recipeData.metaQualityTags}</Text>}
            {recipeData && recipeData.userID && <Text fontSize="md">UserID: {recipeData.userID}</Text>}
            {recipeData && recipeData.createdAt && <Text fontSize="md">Created On: {recipeData.createdAt.split("T")[0]}</Text>}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const Ingredients = ({ ingredients }) => {
  return (
    <Wrap spacing={4} borderRadius={4}>
    {ingredients && ingredients.map((ingredient, index) => (
    <WrapItem key={index} spacing={4} align="center" boxShadow='sm' borderRadius={2}>
      <Popover>
        <PopoverTrigger>
          <Text fontSize="md">{ingredient.name}</Text>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Text fontSize="md">{ingredient.name}</Text>
          </PopoverHeader>
          <PopoverBody>
            <Text fontSize="md">Quantity: {ingredient.quantity}</Text>
            {ingredient.imageCid && <Image src={`https://ipfs.io/ipfs/${ingredient.imageCid}`} alt={ingredient.name} />}
            {ingredient.comments && <Text fontSize="md">Comments: {ingredient.comments}</Text>}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </WrapItem>
    ))}
    </Wrap>
  );
}

const Steps = ({ steps }) => {
  return (
    <Wrap spacing={4}>
    {steps && steps.map((step, index) => (
    <WrapItem key={index} spacing={4} align="center" boxShadow="sm">
      {/* <Text fontSize="md">Step {index + 1}</Text> */}
      <Text fontSize="md">{step.name}</Text>
      <Box>
        <Text as='u' fontSize="md">Action</Text>
        <Text fontSize='md'>{step.action}</Text>
        {step.actionImageCid && <Image src={`https://ipfs.io/ipfs/${step.actionImageCid}`} alt={step.action} />}
      </Box>
      {step.trigger && 
      <Box>
        <Text as='u' fontSize="md">Trigger</Text>
        <Text fontSize='md'>{step.trigger}</Text>
        {step.triggerImageCid && <Image src={`https://ipfs.io/ipfs/${step.triggerImageCid}`} alt={step.trigger} />} 
      </Box>}
      {step.comments && 
      <Box>
        <Text as='u' fontSize="md">Comments</Text>
        <Text fontSize='md'>{step.comments}</Text>
      </Box>}
    </WrapItem>
    ))}
    </Wrap>
  );
}

const TasteProfile = ({ tasteProfile }) => {
  console.log(tasteProfile);
  return (
    <>
    {tasteProfile &&
    <>
      <Text as='b' fontSize="large">Taste Profile</Text>
      <Grid gridTemplateColumns={['1fr', '1fr 1fr']} gridGap={4}>
        <GridItem><Text fontSize="md">Salt: {tasteProfile.salt}</Text></GridItem>
        <GridItem><Text fontSize="md">Sweet: {tasteProfile.sweet}</Text></GridItem>
        <GridItem><Text fontSize="md">Sour: {tasteProfile.sour}</Text></GridItem>
        <GridItem><Text fontSize="md">Bitter: {tasteProfile.bitter}</Text></GridItem>
        <GridItem><Text fontSize="md">Spice: {tasteProfile.spice}</Text></GridItem>
        <GridItem><Text fontSize="md">Umami: {tasteProfile.umami ? tasteProfile.umami : 0}</Text></GridItem>
      </Grid>
    </>
    }
    </>
  );
}

export default ShowRecipes;
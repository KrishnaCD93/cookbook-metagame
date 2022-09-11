import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Box, Checkbox, Container, Divider, Flex, Grid, GridItem, Icon, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Spinner, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { GET_RECIPE_WITH_DATA } from './ShowRecipes';
import { cld } from '../../App';
import { scale } from '@cloudinary/url-gen/actions/resize';
import { AdvancedImage } from '@cloudinary/react';
import { FaComment } from 'react-icons/fa';

const UPDATE_RECIPE = gql`
  mutation Mutation($updateRecipeID: ID!, $userID: String!, $signatureMessage: String!, $name: String, $imageCid: String, $description: String, $ingredientIDs: [ID], $stepIDs: [ID], $tasteProfileID: ID, $qualityTags: String, $equipment: String) {
  updateRecipe(id: $updateRecipeID, userID: $userID, signatureMessage: $signatureMessage, name: $name, imageCid: $imageCid, description: $description, ingredientIDs: $ingredientIDs, stepIDs: $stepIDs, tasteProfileID: $tasteProfileID, qualityTags: $qualityTags, equipment: $equipment) {
    success
    message
    recipeID
  }
}
`

const RecipeDetail = () => {
  const { recipeID } = useParams();
  const [getRecipeWithData, { data, loading, error }] = useLazyQuery(GET_RECIPE_WITH_DATA, { 
    variables: { recipeID: `${recipeID}` } 
  });
  const [recipeData, setRecipeData] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [image, setImage] = useState(null);

  const [updateRecipe] = useMutation(UPDATE_RECIPE);
  const [updateRecipeID, setUpdateRecipeID] = useState(null);

  useEffect(() => {
    const getRecipe = async () => {
      await getRecipeWithData();
      if (data) {
        setRecipeData(data.recipeWithData.recipe);
        setIngredients(data.recipeWithData.ingredients);
        setSteps(data.recipeWithData.steps);
        setTasteProfile(data.recipeWithData.tasteProfile);
      }
    }
    getRecipe();

    return () => {
      setRecipeData(null);
      setIngredients([]);
      setSteps([]);
      setTasteProfile(null);
      setImage(null);
    }
  }, [getRecipeWithData, data]);

  useEffect(() => {
    if (recipeData) {
      const img = cld.image(recipeData.imageCid)
      img.resize(scale().width(1080));
      setImage(img);
    }
  }, [recipeData]);

  if (loading) return <Spinner />;
  
  if (error) console.log('recipe error', error);
  
  if (recipeData) {
    console.log(data)
    return ( 
      <Container>
        <Flex align="center" justify="space-between">
          <Text>{recipeData.name}</Text>
        </Flex>
        <Box>
          <AdvancedImage cldImg={image} />
        </Box>
        <Recipe recipeData={recipeData} ingredients={ingredients} steps={steps} tasteProfile={tasteProfile} />
      </Container> 
    );
  }

  return (
    <Box>
      {recipeID}
    </Box>
  );
}

export const Recipe = ({ recipeData, ingredients, steps, tasteProfile }) => {
  return (
    <VStack spacing={4} align="center" divider={<Divider />}>
      {recipeData && recipeData.description && <Text fontSize="large">{recipeData.description}</Text>}
      {tasteProfile && <TasteProfile tasteProfile={tasteProfile} />}
      {ingredients && <>
        <Text as='b' fontSize="large">Ingredients</Text>
        <Ingredients ingredients={ingredients} />
      </>}
      {steps && <>
        <Text as='b' fontSize="large">Steps</Text>
        <Steps steps={steps} />
      </>}
      {recipeData && recipeData.equipment && <>
        <Text as='b' fontSize="large">Equipment</Text>
        {recipeData.equipment.split(',').map((equipment, index) => (
          <Text key={index}>{equipment}</Text>
        ))}
      </>}
      {recipeData && recipeData.qualityTags && 
        <>
        <Text as='b' fontSize="large">Quality Tags</Text>
        {recipeData.qualityTags.split(',').map((tag, index) => (
        <Text key={index}>{tag}</Text>
        ))}
        </>}
      {recipeData && recipeData.userID && <Text>Created by {recipeData.userID}</Text>}
      {recipeData && recipeData.createdAt && <Text fontSize="md">Created On: {recipeData.createdAt.split("T")[0]}</Text>}
    </VStack>
  )
}

const Ingredients = ({ ingredients }) => {
  return (
    <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={4}>
    {ingredients && ingredients.map((ingredient, index) => (
    <GridItem key={index} spacing={4} align="center" boxShadow='md' borderRadius={2} _hover={{ cursor: 'pointer', boxShadow: 'dark-lg' }}>
      <Popover>
        <PopoverTrigger>
          <Box fontSize="md" m={2}>
            <Text>{ingredient.quantity}</Text>
            <Text>{ingredient.name}</Text>
            {ingredient.comments && <Icon as={FaComment} />}
          </Box>
        </PopoverTrigger>
        {ingredient.comments && <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Text fontSize="md">{ingredient.name}</Text>
          </PopoverHeader>
          <PopoverBody>
            <Text fontSize="md">Comments: {ingredient.comments}</Text>
          </PopoverBody>
        </PopoverContent>}
      </Popover>
    </GridItem>
    ))}
    </Grid>
  );
}

const Steps = ({ steps }) => {
  return (
    <Wrap spacing={4}>
    {steps && steps.map((step, index) => (
    <WrapItem key={index} spacing={4} alignItems="center" boxShadow="sm" justifyContent="center" align='center'>
      <Box>
        <Text fontSize="md">{index + 1}</Text>
        {step.stepName && <Text fontSize="md">{step.stepName}</Text>}
        <Checkbox />
      </Box>
      <Box m={2} p={2}>
        <Text fontSize='md'>{step.action}</Text>
      {step.trigger && 
        <Text fontSize='md'>{step.trigger}</Text>}
      {step.comments && 
        <Text fontSize='md'>{step.comments}</Text>}
      </Box>
    </WrapItem>
    ))}
    </Wrap>
  );
}

const TasteProfile = ({ tasteProfile }) => {
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

export default RecipeDetail;
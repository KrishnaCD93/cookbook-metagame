import { Badge, Box, Button, Grid, GridItem, Heading, Icon, Spacer, Spinner, Text, VStack } from '@chakra-ui/react';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { AdvancedImage, responsive, lazyload, placeholder } from '@cloudinary/react';
import { scale } from "@cloudinary/url-gen/actions/resize";
import { FaExternalLinkAlt, FaSignature } from 'react-icons/fa';
import { cld } from '../../App';
import CreateRecipe from '../../components/CreateRecipe';
import { Link } from 'react-router-dom';
import { Recipe } from './RecipeDetail';

export const GET_RECIPE_WITH_DATA = gql`
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
        qualityTags
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

export const GET_RECIPES = gql`
  query Query {
    recipes {
      _id
      name
      imageCid
      description
      qualityTags
      userID
      signature
    }
  }
`;

const ShowRecipes = () => {
  const { data, loading, error, client } = useQuery(GET_RECIPES);
  const [recipes, setRecipes] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Ensure all recipes are loaded and memoize recipe ordered by createdAt
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
    
  if (error) console.log('recipe error', error)
  
  return (
    <Box>
      <Heading>Recipes</Heading>
      <Box>
        <Button m={2} onClick={onOpen}>Add Recipe</Button>
        <CreateRecipe isOpen={isOpen} onClose={onClose} />
      </Box>
      {loading ? <Spinner  /> :
        <VStack spacing={2}>
          <Spacer mt={4} />
          <Grid templateColumns={{base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)'}}>
            {recipesMemo && recipesMemo.map((recipe, index) => (
              <GridItem key={index}
              onMouseOver={() => 
                client.query({
                  query: GET_RECIPE_WITH_DATA,
                  variables: { recipeID: recipe._id }
                })
              }>
                <RecipeCard recipe={recipe} cld={cld} />
              </GridItem>
            ))}
          </Grid>
        </VStack>}
    </Box>
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

  const image = cld.image(recipe.imageCid)
  image.resize(scale().width(1080));

  useEffect(() => {
    if (isOpen) {
    const getRecipe = async () => {
        setRecipeID(recipe._id);
        await getRecipeWithData();
        if (recipeWithData) {
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
  if (recipeWithLoading) return <Spinner />;
  if (recipeWithError) console.log('recipe error', recipeWithError)
  
  return (
    <>
    <Box mt={2} mb={2} boxShadow='inner' borderRadius={4} onClick={() => showRecipe(recipe)} _hover={{ cursor: 'pointer', bg: 'gray.400' }}>
      <VStack spacing={4} align="center">
        {recipe.imageCid && <AdvancedImage cldImg={image} 
        plugins={[lazyload(), responsive(100), placeholder()]} 
        />}
        <Text fontSize="large">{recipe.name}
          {recipe.signature && <Icon as={FaSignature} size="1.5em" color='blue' ml={2} mb={2} />}
        </Text>
        {recipe.description && <Text fontSize='md'>{recipe.description}</Text>}
        {recipe.qualityTags && recipe.qualityTags.split(',').map((tag, index) => (
          <Badge key={index} colorScheme='teal' variant='subtle'>{tag}</Badge>
          ))}
        <Button variant='ghost' w='100%'>View Recipe</Button>
      </VStack>
    </Box>
    {recipeData && tasteProfile && 
      <RecipeModal isOpen={isOpen} onClose={onClose} recipeData={recipeData} ingredients={ingredients?ingredients:['']} steps={steps?steps:['']} tasteProfile={tasteProfile} />
    }
    </>
  );
}

const RecipeModal = (props) => {
  const { isOpen, onClose, recipeData, ingredients, steps, tasteProfile } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Link to={`/recipes/${recipeData._id}`}><Icon as={FaExternalLinkAlt} /></Link>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Recipe recipeData={recipeData} ingredients={ingredients} steps={steps} tasteProfile={tasteProfile} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default ShowRecipes;
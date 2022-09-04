import { Badge, Box, Button, Checkbox, Divider, Grid, GridItem, Heading, Icon, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Spacer, Spinner, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { AdvancedImage, responsive, lazyload, placeholder } from '@cloudinary/react';
import { scale } from "@cloudinary/url-gen/actions/resize";
import { FaComment, FaExternalLinkAlt, FaSignature } from 'react-icons/fa';
import { cld } from '../../App';
import CreateRecipe from '../../components/CreateRecipe';
import { Link } from 'react-router-dom';

// TODO: add recipe page with recipeID

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
  const { data, loading, error } = useQuery(GET_RECIPES);
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
          <Grid templateColumns={{md: 'repeat(3, 1fr)', base: 'repeat(1, 1fr)'}}>
            {recipesMemo && recipesMemo.map((recipe, index) => (
              <GridItem key={index}>
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
    <Box p={2} m={2} boxShadow='md' borderRadius={4} onClick={() => showRecipe(recipe)} _hover={{ cursor: 'pointer', bg: 'gray.400' }}>
      <VStack spacing={4} align="center">
        <Text fontSize="large">{recipe.name}
          {recipe.signature && <Icon as={FaSignature} size="1.5em" color='blue' ml={2} mb={2} />}
        </Text>
        {recipe.imageCid && <AdvancedImage cldImg={image} 
        plugins={[lazyload(), responsive(100), placeholder()]} 
        />}
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
          {recipeData && recipeData.name &&
          <Link to={`/recipes/${recipeData._id}`}><FaExternalLinkAlt /></Link>}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Recipe recipeData={recipeData} ingredients={ingredients} steps={steps} tasteProfile={tasteProfile} />
        </ModalBody>
      </ModalContent>
    </Modal>
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
    <Grid templateColumns="repeat(auto-fit)" gap={4}>
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

export default ShowRecipes;
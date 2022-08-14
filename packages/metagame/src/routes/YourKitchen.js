import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Divider, Grid, GridItem, HStack, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, Text, Textarea, useDisclosure } from '@chakra-ui/react';
import { gql, useQuery } from '@apollo/client';
import { useAccount, useEnsName } from 'wagmi';
import useApolloMutations from '../hooks/useApolloMutations';
import { FaComment } from 'react-icons/fa';
import CreateRecipe from '../components/CreateRecipe';

// TODO: test uploads and mutation refetch

export const GET_USER_COOKBOOK = gql`
  query UserCookbook($userID: String!) {
    cookbookByUserID(userID: $userID) {
      address
      name
      description
      recipes {
        _id
        name
        ingredientIDs
        stepIDs
        tasteProfileID
      }
      user {
        userID
        name
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
      ingredients {
        _id
        name
        nutrition {
          calories
          fat
          protien
          carbs
        }
        comments
      }
      steps {
        _id
        stepName
        action
        trigger
        comments
      }
      externalRecipes {
        _id
        name
        recipeUrl
        notes
      }
      chefsMetas {
        _id
        recipeID
        specialtyTags
        comments
      }
    }
  }
`;

const MetaKitchen = () => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [userID, setUserID] = useState('');
  const [, , , , uploadExternalRecipe, uploadChefsMeta] = useApolloMutations();
  const { data: cookbookData, loading: cookbookLoading, error: cookbookError, refetch } = useQuery(GET_USER_COOKBOOK, 
    { variables: { userID: `${userID}` }});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: externalIsOpen, onOpen: externalOnOpen, onClose: externalOnClose } = useDisclosure();
  const [showItems, setShowItems] = useState(null);

  useEffect(() => {
    setUserID(address ? address : '0x0');
  }, [address, ensName]);
  
  const cookbookMemo = useMemo(() => {
    if (cookbookData) {
      refetch({ userID: userID });
      const cookbook = cookbookData.cookbookByUserID;
      // remove duplicate ingredients by name
      const ingredients = cookbook.ingredients.reduce((acc, curr) => {
        if (!acc.find(ingredient => ingredient.name === curr.name)) {
          acc.push(curr);
        }
        return acc;
      } , []);
      // remove duplicate steps by stepName
      const steps = cookbook.steps.reduce((acc, curr) => {
        if (!acc.find(step => step.stepName === curr.stepName)) {
          acc.push(curr);
        }
        return acc;
      } , []);

      return {
        ...cookbook,
        ingredients,
        steps
      };
    }
  }, [cookbookData, refetch, userID]);

  const handleSwitch = (item) => {
    setShowItems(item);
  }

  if (cookbookError) console.log('cookbook error', cookbookError);

  return (
    <Box>
      {cookbookLoading && <Spinner />}
      {cookbookMemo && 
      <>
      {cookbookMemo.user && <Text>{cookbookMemo.user.name}'s Kitchen</Text>}
      <Grid gap={4} templateColumns='repeat(2, 1fr)'>
        <GridItem>
          <Box>
            {cookbookMemo.description && <Text>{cookbookMemo.description}</Text>}
            {cookbookMemo.recipes && <Text onClick={() => handleSwitch('recipes')} _hover={{ cursor: 'pointer' }}
            >{cookbookMemo.recipes.length} recipe(s)</Text>}
            {cookbookMemo.ingredients && <Text onClick={() => handleSwitch('ingredients')} _hover={{ cursor: 'pointer' }}
            >{cookbookMemo.ingredients.length} ingredient(s)</Text>}
            {cookbookMemo.steps && <Text onClick={() => handleSwitch('steps')} _hover={{ cursor: 'pointer' }}
            >{cookbookMemo.steps.length} step(s)</Text>}
            {cookbookMemo.tasteProfiles && <Text onClick={() => handleSwitch('tasteProfiles')} _hover={{ cursor: 'pointer' }}
            >{cookbookMemo.tasteProfiles.length} taste profile(s)</Text>}
            {cookbookMemo.externalRecipes && <Text onClick={() => handleSwitch('externalRecipes')} _hover={{ cursor: 'pointer' }}
            >{cookbookMemo.externalRecipes.length} external recipe(s)</Text>}
          </Box>
        </GridItem>
        <GridItem>
          {(() => {
            switch (showItems) {
              case 'recipes':
                return <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {cookbookMemo.recipes && cookbookMemo.recipes.map((recipe, index) => (
                    <GridItem key={index}>
                      <RecipeInfo cookbook={cookbookMemo} recipe={recipe} uploadChefsMeta={uploadChefsMeta} />
                    </GridItem>
                  ))}
                  </Grid>
              case 'ingredients':
                return <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {cookbookMemo.ingredients && cookbookMemo.ingredients.map((ingredient, index) => (
                    <GridItem key={index}>
                      {ingredient.name && <Text>{ingredient.name}</Text>}
                    </GridItem>
                  ))}
                </Grid>
              case 'steps':
                return <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {cookbookMemo.steps && cookbookMemo.steps.map((step, index) => (
                    <GridItem key={index}>
                      {step.stepName && <Text>{step.stepName}</Text>}
                    </GridItem>
                  ))}
                </Grid>
              case 'tasteProfiles':
                return <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {cookbookMemo.tasteProfiles && cookbookMemo.tasteProfiles.map((taste, index) => (
                    <GridItem key={index}>
                      {taste.salt ? <Text>Salt: {taste.salt}</Text> : <Text>Salt: 0</Text>}
                      {taste.sweet ? <Text>Sweet: {taste.sweet}</Text> : <Text>Sweet: 0</Text>}
                      {taste.sour ? <Text>Sour: {taste.sour}</Text> : <Text>Sour: 0</Text>}
                      {taste.bitter ? <Text>Bitter: {taste.bitter}</Text> : <Text>Bitter: 0</Text>}
                      {taste.spicy ? <Text>Spicy: {taste.spicy}</Text> : <Text>Spicy: 0</Text>}
                      {taste.umami ? <Text>Umami: {taste.umami}</Text> : <Text>Umami: 0</Text>}
                    </GridItem>
                  ))}
                </Grid>
              case 'externalRecipes':
                return <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {cookbookMemo.externalRecipes && cookbookMemo.externalRecipes.map((recipe, index) => (
                    <GridItem key={index}>
                      {recipe.name && <Text>{recipe.name}</Text>}
                      {recipe.recipeUrl && <Text onClick={() => window.open(recipe.recipeUrl, '_blank')} _hover={{ cursor: 'pointer' }}>{recipe.recipeUrl}</Text>}
                      {recipe.notes && <Text>{recipe.notes}</Text>}
                    </GridItem>
                  ))}
                </Grid>
              default:
                return null;
            }
          })()}
        </GridItem>
      </Grid>
      </>
      }
      <Container>
        <Button m={4} p={4} onClick={onOpen}>Create Recipe</Button>
        <CreateRecipe isOpen={isOpen} onClose={onClose} />
        {(userID !== '0x0') && <>
        <HStack>
          <Divider />
          <Text>Or</Text>
          <Divider />
        </HStack>
          <Button m={4} p={4} onClick={externalOnOpen}>Add External Recipe</Button>
          <AddExternalRecipe uploadExternalRecipe={uploadExternalRecipe} isOpen={externalIsOpen} onClose={externalOnClose} userID={userID} />
          </>}
      </Container>
    </Box>
  );
}

// This is the component that is rendered for each recipe in the grid to show the chefs meta
const RecipeInfo = ({ recipe, cookbook, uploadChefsMeta }) => {
  const [recipeChefsMeta, setRecipeChefsMeta] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMetas, setShowMetas] = useState(false);

  const handleClick = () => {
    if (cookbook.chefsMetas && cookbook.chefsMetas.find(chefsMeta => chefsMeta.recipeID === recipe._id)) {
      setRecipeChefsMeta(cookbook.chefsMetas.filter(meta => meta.recipeID === recipe._id));
    }
    setShowMetas(!showMetas);
  }

  return (
    <Box>
      <Text onClick={handleClick}>{recipe.name}</Text>
      <IconButton size='sm' ml={2} icon={<FaComment />} onClick={() => setShowForm(!showForm)} />
      {recipeChefsMeta && showMetas && recipeChefsMeta.map((meta, index) => (
        <Box key={index}>
          <Text>{meta.comments}</Text>
          <Text>{meta.specialtyTags}</Text>
        </Box>
      ))}
    {showForm && <AddChefsMeta recipe={recipe} uploadChefsMeta={uploadChefsMeta} />}
    </Box>
  );
}

const AddChefsMeta = ({ recipe, uploadChefsMeta }) => {
  const [comments, setComments] = useState('');
  const [specialtyTags, setSpecialtyTags] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    setUploading(true);
    const chefsMeta = { recipeID: recipe._id, comments, specialtyTags, userID: recipe.userID };
    console.log('chefs meta', chefsMeta);
    await uploadChefsMeta(chefsMeta);
    setUploading(false);
  }

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Text>Comments</Text>
        <Textarea type="text" value={comments} onChange={e => setComments(e.target.value)} />
        <Input type="text" value={specialtyTags} onChange={e => setSpecialtyTags(e.target.value)} />
        <Button type="submit" isDisabled={uploading}>Submit</Button>
      </form>
    </Box>
  );
}

const AddExternalRecipe = ({ uploadExternalRecipe, isOpen, onClose, userID }) => {
  const [name, setName] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    setUploading(true);
    const externalRecipe = { name, recipeUrl, userID, notes };
    await uploadExternalRecipe(externalRecipe);
    setName('');
    setRecipeUrl('');
    setNotes('');
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
            <Input onChange={e => setName(e.target.value)} />
            <Text>Recipe URL</Text>
            <Input onChange={e => setRecipeUrl(e.target.value)} />
            <Text>Recipe Notes</Text>
            <Textarea onChange={e => setNotes(e.target.value)} />
            <Button mt={2} type="submit" isDisabled={uploading}>Submit</Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}



export default MetaKitchen;
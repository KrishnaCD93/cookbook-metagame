import { useLazyQuery } from '@apollo/client';
import { Box, Container, Flex, Icon, Spacer, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { GET_RECIPE_WITH_DATA } from './ShowRecipes';
import { cld } from '../../App';
import { AdvancedImage } from '@cloudinary/react';
import Recipe from '../../components/ViewRecipe';
import GoToTop from '../../components/GoToTop';
import { AiTwotoneEdit } from 'react-icons/ai';

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
      setImage(img);
    }
  }, [recipeData]);

  if (loading) return <Spinner />;
  
  if (error) console.log('recipe error', error);
  
  if (recipeData) {
    return ( 
      <Container>
        <Flex align="center">
          <Text>{recipeData.name}</Text>
          <Spacer />
          <Link to={`/recipes/${recipeData._id}/edit`}><Icon as={AiTwotoneEdit} /></Link>
        </Flex>
        <Box>
          <AdvancedImage cldImg={image} />
        </Box>
        <Recipe recipeData={recipeData} ingredients={ingredients} steps={steps} tasteProfile={tasteProfile} />
        <GoToTop />
      </Container> 
    );
  }

  return (
    <Box>
      {recipeID}
    </Box>
  );
}

export default RecipeDetail;
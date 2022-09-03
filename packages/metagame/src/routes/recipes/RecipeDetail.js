import { useLazyQuery } from '@apollo/client';
import { Box, Container, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { GET_RECIPE_WITH_DATA } from './ShowRecipes';
import { cld } from '../../App';
import { scale } from '@cloudinary/url-gen/actions/resize';
import { AdvancedImage } from '@cloudinary/react';
import { Recipe } from './ShowRecipes';

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
        <Text>{recipeData.name}</Text>
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

export default RecipeDetail;
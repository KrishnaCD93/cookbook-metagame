import { useLazyQuery } from "@apollo/client";
import { cld } from "../App";
import { GET_RECIPE_WITH_DATA } from "../routes/recipes/ShowRecipes";
import logo from '../assets/logo.png';
import { useEffect, useState } from "react";

const useGetRecipeData = (recipeID) => {
  const [getRecipeWithData, { data, error, loading }] = useLazyQuery(GET_RECIPE_WITH_DATA);
  const [recipeData, setRecipeData] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    console.log(recipeID)
    const getRecipeData = async () => {
      await getRecipeWithData(
        { variables: { recipeID: `${recipeID}` } }
      );
    }
    getRecipeData();
    if (data) {
      console.log('data', data);
      setRecipeData(data.recipeWithData.recipe);
      setIngredients(data.recipeWithData.ingredients);
      setSteps(data.recipeWithData.steps);
      setTasteProfile(data.recipeWithData.tasteProfile);
      if (data.recipeWithData.recipe.imageCid) {
        const img = cld.image(data.recipeWithData.recipe.imageCid);
        setImage(img);
      } else if (!data.recipeWithData.recipe.imageCid) {
        setImage(logo);
      }
    }
  }, [getRecipeWithData, data, recipeID]);

  return { recipeData, ingredients, steps, tasteProfile, image, loading, error };
}

export default useGetRecipeData;
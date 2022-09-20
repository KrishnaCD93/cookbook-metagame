import { useLazyQuery } from "@apollo/client";
import { cld } from "../App";
import { GET_RECIPE_WITH_DATA } from "../routes/recipes/ShowRecipes";

const useGetRecipeData = () => {
  const [getRecipeWithData, { data, error, loading }] = useLazyQuery(GET_RECIPE_WITH_DATA);
  
  const getRecipe = async ({ recipeID }) => {
    await getRecipeWithData(
      { variables: { recipeID: `${recipeID}` } }
    );
    if (data) {
      const recipeData = data.recipeWithData.recipe;
      const ingredients = data.recipeWithData.ingredients;
      const steps = data.recipeWithData.steps;
      const tasteProfile = data.recipeWithData.tasteProfile;
      const image = cld.image(recipeData.imageCid)

      const recipe = { recipeData, ingredients, steps, tasteProfile, image };
      
      return recipe;
    }
  }

  return [getRecipe, { error, loading }];
}

export default useGetRecipeData;
import { gql, useMutation } from '@apollo/client';

const CREATE_RECIPE = gql`
  mutation AddRecipe($recipeName: String!, $ingredientIDs: [String]!, $stepIDs: [String]!, $tasteProfile: [Int]!, $userId: String!, $signature: String!, $imageCid: [String], $description: String, $metaQualityTags: [String], $equipment: [String]) {
    addRecipe(recipeName: $recipeName, ingredientIDs: $ingredientIDs, stepIDs: $stepIDs, tasteProfile: $tasteProfile, userID: $userId, signature: $signature, imageCid: $imageCid, description: $description, metaQualityTags: $metaQualityTags, equipment: $equipment) {
      success
      message
      recipe {
        id
        name
      }
    }
  }
`;

const useMongoUpload = () => {
  const [addRecipe, { error }] = useMutation(CREATE_RECIPE);
  const uploadRecipe = async ({ recipe, ingredients, steps, tasteProfile }) => {
    let addedRecipe;
    const data = {
      recipe,
      ingredients,
      steps,
      tasteProfile
    };
    try {
      addedRecipe = await addRecipe(data);
    } catch (error) {
      console.error(error);
    } finally {
      return {
        success: addedRecipe.acknowledged,
        message: error ? error.message : 'Recipe added successfully',
        recipeID: addedRecipe.insertedId
      };
    }
  }
  return [uploadRecipe];
}

export default useMongoUpload;
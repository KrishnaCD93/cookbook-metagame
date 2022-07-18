import { gql, useMutation } from '@apollo/client';

const CREATE_INGREDIENTS = gql`
  mutation AddIngredients($names: [String]!, $quantities: [String]!, $comments: [String], $imageCids: [String], $userId: String, $signature: String) {
    addIngredients(names: $names, quantities: $quantities, comments: $comments, imageCids: $imageCids, userID: $userId, signature: $signature) {
      success
      message
      ingredientIDs
    }
  }
`;

const CREATE_STEPS = gql`
  mutation AddSteps($actions: [String]!, $triggers: [String], $actionImageCids: [String], $triggerImageCids: [String], $comments: [String], $userId: String, $signature: String) {
    addSteps(actions: $actions, triggers: $triggers, actionImageCids: $actionImageCids, triggerImageCids: $triggerImageCids, comments: $comments, userID: $userId, signature: $signature) {
      success
      message
      stepIDs
    }
  }
`;

const CREATE_TASTE_PROFILE = gql`
  mutation AddTasteProfile($salt: Int!, $sweet: Int!, $sour: Int!, $bitter: Int!, $spice: Int!, $userId: ID, $signature: String) {
    addTasteProfile(salt: $salt, sweet: $sweet, sour: $sour, bitter: $bitter, spice: $spice, userID: $userId, signature: $signature) {
      success
      message
      tasteProfileID
    }
  }
`;

const CREATE_RECIPE = gql`
  mutation AddRecipe($name: String!, $ingredientIDs: [ID]!, $stepIDs: [ID]!, $tasteProfileID: ID!, $imageCid: String, $description: String, $metaQualityTags: String, $equipment: String, $userId: String, $signature: String, $createdAt: String) {
    addRecipe(name: $name, ingredientIDs: $ingredientIDs, stepIDs: $stepIDs, tasteProfileID: $tasteProfileID, imageCid: $imageCid, description: $description, metaQualityTags: $metaQualityTags, equipment: $equipment, userID: $userId, signature: $signature, createdAt: $createdAt) {
      success
      message
      recipeID
    }
  }
`;

const useApolloHooks = () => {
  const ingredientsData = {};
  const stepsData = {};
  const tasteProfileData = {};
  const recipeData = {};
  const [addIngredients] = useMutation(CREATE_INGREDIENTS);
  const [addSteps] = useMutation(CREATE_STEPS);
  const [addTasteProfile] = useMutation(CREATE_TASTE_PROFILE);
  const [addRecipe] = useMutation(CREATE_RECIPE);

  const uploadIngredients = async (props) => {
    console.log('uploadIngredients', props);
    const { names, quantities, comments, imageCids, userID, signature } = props;
    await addIngredients({ variables: { names, quantities, comments, imageCids, userID, signature } })
      .then((data) => {
        console.log('uploadIngredients', data);
        ingredientsData.success = data.data.addIngredients.success;
        ingredientsData.message = data.data.addIngredients.message;
        ingredientsData.ingredientIDs = data.data.addIngredients.ingredientIDs;
        console.log('uploadIngredients', ingredientsData);
      })
      .catch((error) => {
        console.log('uploadIngredients error', error);
      })
    return ingredientsData;
  }

  const uploadSteps = async (props) => {
    console.log('uploadSteps', props);
    const { actions, triggers, actionImageCids, triggerImageCids, comments, userID, signature } = props;
    await addSteps({ variables: { actions, triggers, actionImageCids, triggerImageCids, comments, userID, signature } })
      .then((data) => {
        console.log('uploadSteps', data);
        stepsData.success = data.data.addSteps.success;
        stepsData.message = data.data.addSteps.message;
        stepsData.stepIDs = data.data.addSteps.stepIDs;
        console.log('uploadSteps', stepsData);
      })
      .catch((error) => {
        console.log('uploadSteps error', error);
      });
    return stepsData;
  }

  const uploadTasteProfile = async (props) => {
    console.log('uploadTasteProfile', props);
    const { salt, sweet, sour, bitter, spice, userID, signature } = props;
    await addTasteProfile({ 
      variables: { 
        salt: parseInt(salt),
        sweet: parseInt(sweet),
        sour: parseInt(sour),
        bitter: parseInt(bitter),
        spice: parseInt(spice),
        userID, signature } })
      .then((data) => {
        console.log('uploadTasteProfile', data);
        tasteProfileData.success = data.data.addTasteProfile.success;
        tasteProfileData.message = data.data.addTasteProfile.message;
        tasteProfileData.tasteProfileID = data.data.addTasteProfile.tasteProfileID;
        console.log('uploadTasteProfile', tasteProfileData);
      })
      .catch((error) => {
        console.log('uploadTasteProfile error', error);
      })
    return tasteProfileData;
  }

  const uploadRecipe = async (props) => {
    console.log('uploadRecipe', props);
    const { 
      name, imageCid, description, ingredientIDs, stepIDs, tasteProfileID, metaQualityTags, equipment, userID, signature, createdAt 
    } = props;
    await addRecipe({ variables: { 
      name, imageCid, description, ingredientIDs, stepIDs, tasteProfileID, metaQualityTags, equipment, userID, signature, createdAt 
    } })
      .then((data) => {
        console.log('uploadRecipe', data);
        recipeData.success = data.data.addRecipe.success;
        recipeData.message = data.data.addRecipe.message;
        recipeData.recipeID = data.data.addRecipe.recipeID;
        console.log('uploadRecipe', recipeData);
      })
      .catch((error) => {
        console.log('uploadRecipe error', error);
      })
    return recipeData;
  }

  return [uploadIngredients, uploadSteps, uploadTasteProfile, uploadRecipe];
}

export default useApolloHooks;
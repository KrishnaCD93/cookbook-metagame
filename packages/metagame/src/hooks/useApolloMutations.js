import { gql, useMutation } from '@apollo/client';

const CREATE_INGREDIENTS = gql`
  mutation Mutation($names: [String]!, $quantities: [String]!, $comments: [String], $imageCids: [String], $userID: String, $signature: String) {
    addIngredients(names: $names, quantities: $quantities, comments: $comments, imageCids: $imageCids, userID: $userID, signature: $signature) {
      success
      message
      ingredientIDs
    }
  }
`;

const CREATE_STEPS = gql`
  mutation Mutation($actions: [String]!, $stepNames: [String], $triggers: [String], $actionImageCids: [String], $triggerImageCids: [String], $comments: [String], $userID: String, $signature: String) {
    addSteps(actions: $actions, stepNames: $stepNames, triggers: $triggers, actionImageCids: $actionImageCids, triggerImageCids: $triggerImageCids, comments: $comments, userID: $userID, signature: $signature) {
      success
      message
      stepIDs
    }
  }
`;

const CREATE_TASTE_PROFILE = gql`
  mutation Mutation($salt: Int!, $sweet: Int!, $sour: Int!, $bitter: Int!, $spice: Int!, $umami: Int, $userID: ID, $signature: String) {
    addTasteProfile(salt: $salt, sweet: $sweet, sour: $sour, bitter: $bitter, spice: $spice, umami: $umami, userID: $userID, signature: $signature) {
      success
      message
      tasteProfileID
    }
  }
`;

const CREATE_RECIPE = gql`
  mutation Mutation($name: String!, $ingredientIDs: [ID]!, $stepIDs: [ID]!, $tasteProfileID: ID!, $imageCid: String, $description: String, $metaQualityTags: String, $equipment: String, $userID: String, $signature: String, $createdAt: String) {
    addRecipe(name: $name, ingredientIDs: $ingredientIDs, stepIDs: $stepIDs, tasteProfileID: $tasteProfileID, imageCid: $imageCid, description: $description, metaQualityTags: $metaQualityTags, equipment: $equipment, userID: $userID, signature: $signature, createdAt: $createdAt) {
      success
      message
      recipeID
    }
  }
`;

const CREATE_RECIPE_IMAGE = gql`
  mutation Mutation($userID: ID!, $recipeName: String!, $tasteProfile: [Int]!, $signature: String!, $imageUri: String!) {
    addRecipeImage(userID: $userID, recipeName: $recipeName, tasteProfile: $tasteProfile, signature: $signature, imageUri: $imageUri) {
      success
      message
      imageCid
    }
  }
`;

const useApolloMutations = () => {
  const ingredientsData = {};
  const stepsData = {};
  const tasteProfileData = {};
  const recipeData = {};
  const recipeImageData = {};
  const [addIngredients] = useMutation(CREATE_INGREDIENTS);
  const [addSteps] = useMutation(CREATE_STEPS);
  const [addTasteProfile] = useMutation(CREATE_TASTE_PROFILE);
  const [addRecipe] = useMutation(CREATE_RECIPE);
  const [addRecipeImage] = useMutation(CREATE_RECIPE_IMAGE);

  const uploadIngredients = async (props) => {
    console.log('uploadIngredients', props);
    const { names, quantities, comments, imageCids, userID } = props;
    await addIngredients({ variables: { names, quantities, comments, imageCids, userID } })
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
    const { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID } = props;
    await addSteps({ variables: { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID } })
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
    const { salt, sweet, sour, bitter, spice, umami, userID } = props;
    await addTasteProfile({ 
      variables: { 
        salt: parseInt(salt),
        sweet: parseInt(sweet),
        sour: parseInt(sour),
        bitter: parseInt(bitter),
        spice: parseInt(spice),
        umami: parseInt(umami),
        userID 
      } 
    })
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

  const uploadRecipeImage = async (props) => {
    console.log('uploadRecipeImage', props);
    const { imageUri, userID, recipeName, tasteProfile, signature } = props;
    const tasteProfileArray = [];
    tasteProfileArray[0] = parseInt(tasteProfile.salt);
    tasteProfileArray[1] = parseInt(tasteProfile.sweet);
    tasteProfileArray[2] = parseInt(tasteProfile.sour);
    tasteProfileArray[3] = parseInt(tasteProfile.bitter);
    tasteProfileArray[4] = parseInt(tasteProfile.spice);
    tasteProfileArray[5] = parseInt(tasteProfile.umami);
    await addRecipeImage({ variables: { imageUri, userID, recipeName, tasteProfile: tasteProfileArray, signature } })
      .then((data) => {
        console.log('uploadRecipeImage', data);
        recipeImageData.success = data.data.addRecipeImage.success;
        recipeImageData.message = data.data.addRecipeImage.message;
        recipeImageData.imageCid = data.data.addRecipeImage.imageCid;
        console.log('uploadRecipeImage', recipeImageData);
      }).catch((error) => {
        console.log('uploadRecipeImage error', error);
      })
    return recipeImageData;
  }

  return [uploadIngredients, uploadSteps, uploadTasteProfile, uploadRecipe, uploadRecipeImage];
}

export default useApolloMutations;
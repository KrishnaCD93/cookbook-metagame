import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { GET_RECIPES } from '../routes/ShowRecipes';
import { GET_USER_COOKBOOK } from '../routes/YourKitchen';

const CREATE_INGREDIENTS = gql`
  mutation Mutation($names: [String]!, $quantities: [String]!, $comments: [String], $imageCids: [String], $userID: String!, $signatureMessage: String!) {
    addIngredients(names: $names, quantities: $quantities, comments: $comments, imageCids: $imageCids, userID: $userID, signatureMessage: $signatureMessage) {
      success
      message
      ingredientIDs
    }
  }
`;

const CREATE_STEPS = gql`
  mutation Mutation($actions: [String]!, $userID: String!, $stepNames: [String], $triggers: [String], $actionImageCids: [String], $triggerImageCids: [String], $comments: [String], $signatureMessage: String!) {
    addSteps(actions: $actions, userID: $userID, stepNames: $stepNames, triggers: $triggers, actionImageCids: $actionImageCids, triggerImageCids: $triggerImageCids, comments: $comments, signatureMessage: $signatureMessage) {
      success
      message
      stepIDs
    }
  }
`;

const CREATE_TASTE_PROFILE = gql`
  mutation Mutation($salt: Int!, $sweet: Int!, $sour: Int!, $bitter: Int!, $spice: Int!, $umami: Int, $userID: String!, $signatureMessage: String!) {
    addTasteProfile(salt: $salt, sweet: $sweet, sour: $sour, bitter: $bitter, spice: $spice, umami: $umami, userID: $userID, signatureMessage: $signatureMessage) {
      success
      message
      tasteProfileID
    }
  }
`;

const CREATE_RECIPE = gql`
  mutation Mutation($name: String!, $tasteProfileID: ID!, $userID: String!, $signatureMessage: String!, $imageCid: String, $description: String, $ingredientIDs: [ID], $stepIDs: [ID], $qualityTags: String, $equipment: String, $createdAt: String) {
    addRecipe(name: $name, tasteProfileID: $tasteProfileID, userID: $userID, signatureMessage: $signatureMessage, imageCid: $imageCid, description: $description, ingredientIDs: $ingredientIDs, stepIDs: $stepIDs, qualityTags: $qualityTags, equipment: $equipment, createdAt: $createdAt) {
      success
      message
      recipeID
    }
  }
`;

const CREATE_EXTERNAL_RECIPE = gql`
  mutation Mutation($name: String, $recipeUrl: String, $userID: String!, $notes: String) {
    addExternalRecipe(name: $name, recipeUrl: $recipeUrl, userID: $userID, notes: $notes) {
      success
      message
      externalRecipeID
    }
  }
`;

const CREATE_CHEFS_META = gql`
  mutation Mutation($recipeID: ID!, $specialtyTags: [String], $comments: [String], $userID: String!) {
    addChefsMeta(recipeID: $recipeID, specialtyTags: $specialtyTags, comments: $comments, userID: $userID) {
      success
      message
      chefsMetaID
    }
  }
`;

const PREPARE_RECIPE_NFT = gql`
  mutation Mutation($userID: ID!, $recipeID: ID, $nftCid: String, $prompt: String, $signature: String) {
    addContestEntry(userID: $userID, recipeID: $recipeID, nftCid: $nftCid, prompt: $prompt, signature: $signature) {
      success
      message
      contestEntryID
    }
  }
`;

const CREATE_RECIPE_REQUEST = gql`
  mutation Mutation($name: String!, $description: String!, $userID: String!, $imageCid: String, $tasteProfileID: ID!, $nutritionalRequirements: String, $dietaryRequirements: String, $qualityTags: String, $equipment: String, $createdAt: String, $signatureMessage: String!) {
    addRecipeRequest(name: $name, description: $description, userID: $userID, imageCid: $imageCid, tasteProfileID: $tasteProfileID, nutritionalRequirements: $nutritionalRequirements, dietaryRequirements: $dietaryRequirements, qualityTags: $qualityTags, equipment: $equipment, createdAt: $createdAt, signatureMessage: $signatureMessage) {
      success
      message
      recipeRequestID
    }
  }
`;

const useApolloMutations = () => {
  const [userID, setUserID] = useState('');
  const [addIngredients] = useMutation(CREATE_INGREDIENTS);
  const [addSteps] = useMutation(CREATE_STEPS);
  const [addTasteProfile] = useMutation(CREATE_TASTE_PROFILE);
  const [addRecipe] = useMutation(CREATE_RECIPE, {
    refetchQueries: [{ query: GET_RECIPES }]
  });
  const [addExternalRecipe] = useMutation(CREATE_EXTERNAL_RECIPE, {
    refetchQueries: [{ query: GET_USER_COOKBOOK, variables: { userID: userID } }]
  })
  const [addChefsMeta] = useMutation(CREATE_CHEFS_META, {
    refetchQueries: [{ query: GET_USER_COOKBOOK, variables: { userID: userID } }]
  });
  const [addContestEntry] = useMutation(PREPARE_RECIPE_NFT, {
    refetchQueries: [{ query: GET_RECIPES }]
  });
  const [addRecipeRequest] = useMutation(CREATE_RECIPE_REQUEST)
  
  const uploadIngredients = async (props) => {
    const { names, quantities, comments, imageCids, userID, signatureMessage } = props;
    const ingredientsData = {};
    await addIngredients({ variables: { names, quantities, comments, imageCids, userID, signatureMessage } })
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
    console.log('uploadSteps props', props);
    const { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID, signatureMessage } = props;
    const stepsData = {};
    await addSteps({ variables: { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID, signatureMessage } })
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
    const { salt, sweet, sour, bitter, spice, umami, userID, signatureMessage } = props;
    console.log('uploadTasteProfile', props);
    const tasteProfileData = {};
    await addTasteProfile({ 
      variables: { 
        salt: parseInt(salt),
        sweet: parseInt(sweet),
        sour: parseInt(sour),
        bitter: parseInt(bitter),
        spice: parseInt(spice),
        umami: parseInt(umami),
        userID,
        signatureMessage 
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
    const { 
      name, imageCid, description, ingredientIDs, stepIDs, tasteProfileID, qualityTags, equipment, userID, createdAt, signatureMessage 
    } = props;
    const recipeData = {};
    await addRecipe({ variables: { 
      name, imageCid, description, ingredientIDs, stepIDs, tasteProfileID, qualityTags, equipment, userID, createdAt, signatureMessage 
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

  const uploadExternalRecipe = async (props) => {
    const { name, recipeUrl, userID, notes } = props;
    console.log('uploadExternalRecipe', props);
    const externalRecipeData = {};
    await addExternalRecipe({ variables: { name, recipeUrl, userID, notes } })
      .then((data) => {
        console.log('uploadExternalRecipe', data);
        externalRecipeData.success = data.data.addExternalRecipe.success;
        externalRecipeData.message = data.data.addExternalRecipe.message;
        externalRecipeData.recipeID = data.data.addExternalRecipe.externalRecipeID;
        console.log('uploadExternalRecipe', externalRecipeData);
      })
      .catch((error) => {
        console.log('uploadExternalRecipe error', error);
      })
    return externalRecipeData;
  }

  const uploadChefsMeta = async (props) => {
    const { recipeID, specialtyTags, comments, userID } = props;
    setUserID(userID);
    const chefsMetaData = {};
    await addChefsMeta({ variables: { recipeID, comments, specialtyTags, userID } })
      .then((data) => {
        chefsMetaData.success = data.data.addChefsMeta.success;
        chefsMetaData.message = data.data.addChefsMeta.message;
        chefsMetaData.chefsMetaID = data.data.addChefsMeta.chefsMetaID;
        console.log('uploadChefsMeta', chefsMetaData);
      }
      ).catch((error) => {
        console.log('uploadChefsMeta error', error);
      })
    setUserID(null);
    return chefsMetaData;
  }

  const uploadContestEntry = async (props) => {
    const { recipeID, userID, prompt, signature } = props;
    const contestEntryData = {};
    await addContestEntry({ variables: { recipeID, userID, prompt, signature } })
      .then((data) => {
        contestEntryData.success = data.data.addContestEntry.success;
        contestEntryData.message = data.data.addContestEntry.message;
        contestEntryData.contestEntryID = data.data.addContestEntry.contestEntryID;
        console.log('uploadContestEntry', contestEntryData);
      }
      ).catch((error) => {
        console.log('uploadContestEntry error', error);
      })
    return contestEntryData;
  }

  const uploadRecipeRequest = async (props) => {
    console.log('uploadRecipeRequest', props);
    const { name, description, imageCid, tasteProfileID, nutritionalRequirements, dietaryRequirements, qualityTags, equipment, userID, createdAt, signatureMessage } = props;
    const recipeRequestData = {};
    await addRecipeRequest({ variables: { name, description, imageCid, tasteProfileID, nutritionalRequirements, dietaryRequirements, qualityTags, equipment, userID, createdAt, signatureMessage } })
      .then((data) => {
        recipeRequestData.success = data.data.addRecipeRequest.success;
        recipeRequestData.message = data.data.addRecipeRequest.message;
        recipeRequestData.recipeRequestID = data.data.addRecipeRequest.recipeRequestID;
        console.log('uploadRecipeRequest', recipeRequestData);
      }
      ).catch((error) => {
        console.log('uploadRecipeRequest error', error);
      })
    return recipeRequestData;
  }

  return [uploadIngredients, uploadSteps, uploadTasteProfile, uploadRecipe, uploadExternalRecipe, uploadChefsMeta, uploadContestEntry, uploadRecipeRequest];
}

export default useApolloMutations;
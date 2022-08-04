import { gql, useMutation } from '@apollo/client';
import Resizer from 'react-image-file-resizer';
import { GET_RECIPES } from '../routes/ShowRecipes';
import { GET_USER_COOKBOOK } from '../routes/YourCookbook';

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
  mutation Mutation($name: String!, $ingredientIDs: [ID]!, $stepIDs: [ID]!, $tasteProfileID: ID!, $imageCid: String, $description: String, $qualityTags: String, $equipment: String, $userID: String, $signature: String, $createdAt: String) {
    addRecipe(name: $name, ingredientIDs: $ingredientIDs, stepIDs: $stepIDs, tasteProfileID: $tasteProfileID, imageCid: $imageCid, description: $description, qualityTags: $qualityTags, equipment: $equipment, userID: $userID, signature: $signature, createdAt: $createdAt) {
      success
      message
      recipeID
    }
  }
`;

const CREATE_EXTERNAL_RECIPE = gql`
  mutation Mutation($name: String, $recipeUrl: String, $userId: String, $signature: String) {
    addExternalRecipe(name: $name, recipeUrl: $recipeUrl, userID: $userId, signature: $signature) {
      success
      message
      externalRecipeID
    }
  }
`;

const CREATE_CHEFS_META = gql`
  mutation Mutation($recipeId: ID!, $specialtyTags: [String], $comments: [String], $signature: String) {
    addChefsMeta(recipeID: $recipeId, specialtyTags: $specialtyTags, comments: $comments, signature: $signature) {
      success
      message
      chefsMetaID
    }
  }
`;

const cloudinaryUploadEndpoint = 'https://api.cloudinary.com/v1_1/cookbook-social/auto/upload';

const useApolloMutations = () => {
  const ingredientsData = {};
  const stepsData = {};
  const tasteProfileData = {};
  const recipeData = {};
  const [addIngredients] = useMutation(CREATE_INGREDIENTS);
  const [addSteps] = useMutation(CREATE_STEPS);
  const [addTasteProfile] = useMutation(CREATE_TASTE_PROFILE);
  const [addRecipe] = useMutation(CREATE_RECIPE, {
    refetchQueries: [{ query: GET_RECIPES }]
  });
  const [addExternalRecipe] = useMutation(CREATE_EXTERNAL_RECIPE, {
    refetchQueries: [{ query: GET_USER_COOKBOOK}]
  })
  const [addChefsMeta] = useMutation(CREATE_CHEFS_META, {
    refetchQueries: [{ query: GET_USER_COOKBOOK}]
  });

  const uploadIngredients = async (props) => {
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

  const uploadRecipeImage = async (props) => {
    try {
      const resizeFile = (file) =>
      new Promise((resolve) => {
        Resizer.imageFileResizer(
          file,
          1080,
          1080,
          "JPEG",
          100,
          0,
          (uri) => {
            resolve(uri);
          },
          "base64"
        );
      });
      const resizedFile = await resizeFile(props);
      const formData = new FormData();
      formData.append('file', resizedFile);
      formData.append('upload_preset', 'jvcboirw');
      const options = {
        method: 'POST',
        body: formData
      };
      const response = await fetch(cloudinaryUploadEndpoint, options);
      const data = await response.json();
      console.log('uploadRecipeImage', data);
      return data.public_id;
    } catch (error) {
      console.log('uploadRecipeImage error', error);
    }
  }

  const uploadRecipe = async (props) => {
    const { 
      name, imageCid, description, ingredientIDs, stepIDs, tasteProfileID, qualityTags, equipment, userID, signature, createdAt 
    } = props;
    await addRecipe({ variables: { 
      name, imageCid, description, ingredientIDs, stepIDs, tasteProfileID, qualityTags, equipment, userID, signature, createdAt 
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
    const { name, recipeUrl, userID, signature } = props;
    const externalRecipeData = {};
    await addExternalRecipe({ variables: { name, recipeUrl, userID, signature } })
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
    const { recipeID, specialtyTags, comments, signature } = props;
    const commentData = [];
    const tagData = [];
    commentData.push(comments);
    tagData.push(specialtyTags);
    const chefsMetaData = {};
    await addChefsMeta({ variables: { recipeID, comments: commentData, specialtyTags: tagData, signature } })
      .then((data) => {
        console.log('uploadChefsMeta', data);
        chefsMetaData.success = data.data.addChefsMeta.success;
        chefsMetaData.message = data.data.addChefsMeta.message;
        chefsMetaData.chefsMetaID = data.data.addChefsMeta.chefsMetaID;
        console.log('uploadChefsMeta', chefsMetaData);
      }
      ).catch((error) => {
        console.log('uploadChefsMeta error', error);
      })
    return chefsMetaData;
  }

  return [uploadIngredients, uploadSteps, uploadTasteProfile, uploadRecipeImage, uploadRecipe, uploadExternalRecipe, uploadChefsMeta];
}

export default useApolloMutations;
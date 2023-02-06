const { AuthenticationError } = require('apollo-server');
const { MongoClient, ObjectId } = require('mongodb');
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');

const mongoPassword = process.env.MONGO_DB_PASSWORD;
const mongoURI = `mongodb+srv://cookbook:${mongoPassword}@cluster0.2k2xd.mongodb.net/?retryWrites=true&w=majority`
const mongoClient = new MongoClient(mongoURI);
const db = mongoClient.db('cookbookSocial');
const recipeCollection = db.collection('recipes');
const ingredientCollection = db.collection('ingredients');
const stepCollection = db.collection('steps');
const tasteProfileCollection = db.collection('tasteProfiles');
const externalRecipeCollection = db.collection('externalRecipes');
const chefsSpecialCollection = db.collection('chefsSpecial');
const cookbookCollection = db.collection('cookbook');
const userCollection = db.collection('users');
const requestCollection = db.collection('requests');

const { File } = require('nft.storage');
const { verifyMessage } = require('ethers/lib/utils');

// const privateKey = process.env.COOKBOOK_PRIV_KEY;
// const editionAddress = process.env.THIRDWEB_EDITION_ADDRESS;
// const sdk = ThirdwebSDK.fromPrivateKey(privateKey, 'mumbai');

const authenticate = (props) => {
  const { type, signature, message, token, userID } = props;
  let authenticated = false;
  if (type === 'SIGNATURE') {
    const address = verifyMessage(message, signature); 
    if (address === userID) {
      authenticated = true;
    } else {
      throw new AuthenticationError('Not authorized');
    }
  } else if (type === 'JWT') {
    if (token !== '') {
      authenticated = true;
    } else {
      throw new AuthenticationError('Not authorized');
    }
  } else if (type === 'NONE') {
    throw new AuthenticationError('Not authorized');
  }
  return authenticated;
};

const resolvers = {
  Query: {
    recipes: async () => {
      await mongoClient.connect();
      const recipes = await recipeCollection.find({}).toArray();
      await mongoClient.close();
      return recipes.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
    },
    recipesByUserID: async (_, args, context, info) => {
      await mongoClient.connect();
      const userRecipes = await recipeCollection.find({ userID: args.userID }).toArray();
      await mongoClient.close();
      return userRecipes.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
    recipeWithData: async (_, args, context, info) => {
      const { recipeID } = args;
      let recipe;
      const ingredients = [];
      const steps = [];
      let tasteProfile;
      await mongoClient.connect();
      try {
        recipe = await recipeCollection.findOne({ _id: new ObjectId(recipeID) });
        for (const ingredientID of recipe.ingredientIDs) {
          const ingredientData = await ingredientCollection.findOne({ _id: new ObjectId(ingredientID) });
          ingredients.push(ingredientData);
        }
        for (const stepID of recipe.stepIDs) {
          const stepData = await stepCollection.findOne({ _id: new ObjectId(stepID) });
          steps.push(stepData);
        }
        tasteProfile = await tasteProfileCollection.findOne({ _id: new ObjectId(recipe.tasteProfileID) });
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          recipe: recipe,
          ingredients: ingredients,
          steps: steps,
          tasteProfile: tasteProfile
        }
      }
    },
    ingredients: async () => {
      await mongoClient.connect();
      const ingredients = await ingredientCollection.find({}).toArray();
      await mongoClient.close();
      return ingredients;
    },
    ingredientByID: async (_, args, context, info) => {
      let ingredient
      try {
        await mongoClient.connect();
        ingredient = await ingredientCollection.findOne({ _id: new ObjectId(args.id) });
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return ingredient;
      }
    },
    ingredientsByUserID: async (_, args, context, info) => {
      await mongoClient.connect();
      const ingredients = await ingredientCollection.find({ userID: args.userID }).toArray();
      await mongoClient.close();
      return ingredients;
    },
    steps: async () => {
      await mongoClient.connect();
      const steps = await stepCollection.find({}).toArray();
      await mongoClient.close();
      return steps;
    },
    stepByID: async (_, args, context, info) => {
      await mongoClient.connect();
      const step = await stepCollection.findOne({ _id: new ObjectId(args.id) });
      await mongoClient.close();
      return step;
    },
    stepsByUserID: async (_, args, context, info) => {
      await mongoClient.connect();
      const steps = await stepCollection.find({ userID: args.userID }).toArray();
      await mongoClient.close();
      return steps;
    },
    tasteProfiles: async () => {
      await mongoClient.connect();
      const tasteProfiles = await tasteProfileCollection.find({}).toArray();
      await mongoClient.close();
      return tasteProfiles;
    },
    tasteProfileByID: async (_, args, context, info) => {
      await mongoClient.connect();
      const tasteProfile = await tasteProfileCollection.findOne({ _id: new Object(args.id) });
      await mongoClient.close();
      return tasteProfile;
    },
    tasteProfilesByUserID: async (_, args, context, info) => {
      await mongoClient.connect();
      const tasteProfiles = await tasteProfileCollection.find({ userID: args.userID }).toArray();
      await mongoClient.close();
      return tasteProfiles;
    },
    chefsSpecialByUserID: async (_, args, context, info) => {
      await mongoClient.connect();
      const chefsSpecial = await chefsSpecialCollection.find({ userID: args.userID }).toArray();
      await mongoClient.close();
      return chefsSpecial;
    },
    cookbooks: async () => {
      await mongoClient.connect();
      const cookbooks = await cookbookCollection.find({}).toArray();
      await mongoClient.close();
      return cookbooks;
    },
    cookbookByUserID: async (_, { userID }, context, info) => {
      const cookbook = {
        recipes: [],
        ingredients: [],
        steps: [],
        tasteProfiles: [],
        chefsSpecials: [],
        externalRecipes: [],
        user: {}
      };
      try {
        await mongoClient.connect();
        cookbook.recipes = await recipeCollection.find({ userID: userID }).toArray();
        cookbook.ingredients = await ingredientCollection.find({ userID: userID }).toArray();
        cookbook.steps = await stepCollection.find({ userID: userID }).toArray();
        cookbook.tasteProfiles = await tasteProfileCollection.find({ userID: userID }).toArray();
        cookbook.chefsSpecials = await chefsSpecialCollection.find({ userID: userID }).toArray();
        cookbook.externalRecipes = await externalRecipeCollection.find({ userID: userID }).toArray();
        cookbook.user = await userCollection.findOne({ userID: userID });
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return cookbook;
      }
    },
    user: async (_, args, context, info) => {
      let user;
      try {
        await mongoClient.connect();
        user = await userCollection.findOne({ userID: args.userID });
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return user;
      }
    }
  },
  Mutation: {
    addIngredients: async (_, args, context, info) => {
      const { names, quantities, nutritions, comments, imageCids, userID } = args;
      let addedIngredients;
      try {
        await mongoClient.connect();
        const newIngredients = [];
        names.forEach((name, index) => {
          const ingredient = {};
          ingredient.name = name;
          ingredient.quantity = quantities[index];
          ingredient.userID = userID;
          if (nutritions && nutritions[index]) ingredient.nutritions = nutritions[index];
          if (comments && comments[index]) ingredient.comments = comments[index];
          if (imageCids && imageCids[index]) ingredient.imageCid = imageCids[index];
          newIngredients.push(ingredient);
        });
        addedIngredients = await ingredientCollection.insertMany(newIngredients);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        const ingredientsIds = [];
        for (const property in addedIngredients.insertedIds) {
          ingredientsIds.push(addedIngredients.insertedIds[property]);
        }
        return {
          success: addedIngredients.acknowledged,
          message: addedIngredients.acknowledged ? 'Ingredient added successfully' : 'Ingredient not added',
          ingredientIDs: ingredientsIds
        }
      }
    },
    addSteps: async (_, args, context, info) => {
      const { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID } = args;
      let addedSteps;
      try {
        const newSteps = [];
        actions.forEach((action, index) => {
          const step = {};
          step.userID = userID;
          step.action = action;
          if (stepNames && stepNames[index]) step.stepName = stepNames[index];
            else step.stepName = 'Step ' + (index + 1);
          if (triggers && triggers[index]) step.trigger = triggers[index];
          if (actionImageCids && actionImageCids[index]) step.actionImageCid = actionImageCids[index];
          if (triggerImageCids && triggerImageCids[index]) step.triggerImageCid = triggerImageCids[index];
          if (comments && comments[index]) step.comments = comments[index];
          newSteps.push(step);
        });
        await mongoClient.connect();
        addedSteps = await stepCollection.insertMany(newSteps);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        const stepIds = [];
        for (const property in addedSteps.insertedIds) {
          stepIds.push(addedSteps.insertedIds[property]);
        }
        return {
          success: addedSteps.acknowledged,
          message: addedSteps.acknowledged ? 'Step added successfully' : 'Step not added',
          stepIDs: stepIds
        }
      }
    },
    addTasteProfile: async (_, args, context, info) => {
      const { salt, sweet, sour, bitter, spice, umami, userID } = args;
      let addedTasteProfile;
      try {
        const newTasteProfile = {
          salt: salt,
          sweet: sweet,
          sour: sour,
          bitter: bitter,
          spice: spice,
          umami: umami,
          userID: userID,
        };
        await mongoClient.connect();
        addedTasteProfile = await tasteProfileCollection.insertOne(newTasteProfile);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: addedTasteProfile.acknowledged,
          message: addedTasteProfile.acknowledged ? 'Taste profile added successfully' : 'Taste profile not added',
          tasteProfileID: addedTasteProfile.insertedId
        }
      }
    },
    addRecipe: async (_, args, context, info) => {
      const { type, signature, message, token } = context.auth;
      const { name, description, imageCid, ingredientIDs, stepIDs, tasteProfileID, equipment, userID, createdAt, qualityTags } = args;
      let addedRecipe;
      try {
        const authenticated = authenticate({ type, signature, message, token, userID });
        if (!authenticated) throw new Error('Authentication failed');
        const newRecipe = {
          name,
          imageCid,
          description,
          ingredientIDs,
          stepIDs,
          tasteProfileID,
          equipment,
          userID,
          signature,
          createdAt,
          qualityTags
        };
        await mongoClient.connect();
        addedRecipe = await recipeCollection.insertOne(newRecipe);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: addedRecipe.acknowledged,
          message: addedRecipe.acknowledged ? 'Recipe added successfully' : 'Error adding recipe',
          recipeID: addedRecipe.insertedId
        };
      }
    },
    deleteRecipe: async (_, args, context, info) => {
      const { type, signature, token } = context.auth;
      const { ingredientIDs, stepIDs, tasteProfileID, recipeID } = args;
      try {
        if (type === 'SIGNATURE') {
          const address = verifyMessage(authMessage, signature); 
          if (address !== args.userID) {
            throw new AuthenticationError('Not authorized');
          } 
        } else if (type === 'JWT') {
          if (authMessage.split(' ')[-1] !== token) {
            throw new AuthenticationError('Not authorized');
          }
        } else if (type === 'NONE') {
          throw new AuthenticationError('Not authorized');
        }
        if (recipeCollection.find(recipe => recipe._id === recipeID)) {
          await mongoClient.connect();
          await recipeCollection.deleteOne({ id: recipeID });
          await ingredientCollection.deleteMany({ id: { $in: ingredientIDs } });
          await stepCollection.deleteMany({ id: { $in: stepIDs } });
          await tasteProfileCollection.deleteOne({ id: tasteProfileID });
          let newRecipeList = await recipeCollection.find({}).toArray();
          recipes.push(newRecipeList);
          deleted = true;
        } else {
          return {
            success: false,
            message: 'Recipe does not exist',
            recipeID: args.id
          }
        }
      } catch (error) {
        deleted = false;
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: deleted ? true : false,
          message: deleted ? 'Recipe deleted successfully' : 'Signature does not match',
          recipeID: ''
        }
      }
    },
    updateRecipe: async (_, args, context, info) => {
      const { type, signature, token } = context.auth;
      try {
        if (type === 'SIGNATURE') {
          const address = verifyMessage(authMessage, signature); 
          if (address !== args.userID) {
            throw new AuthenticationError('Not authorized');
          } 
        } else if (type === 'JWT') {
          if (authMessage.split(' ')[-1] !== token) {
            throw new AuthenticationError('Not authorized');
          }
        } else if (type === 'NONE') {
          throw new AuthenticationError('Not authorized');
        }
        let updated = false;
        let newRecipeList = [];
        let recipeToUpdate = {}
        if (recipeCollection.find(recipe => recipe._id === args.id)) {
          if (args.cookbookAddress) recipeToUpdate.cookbookAddress = args.cookbookAddress;
          if (args.tokenNumber) recipeToUpdate.tokenNumber = args.tokenNumber;
          if (args.name) recipeToUpdate.name = args.name;
          if (args.imageCid) recipeToUpdate.image = args.imageCid;
          if (args.description) recipeToUpdate.description = args.description;
          if (args.ingredientIDs) recipeToUpdate.ingredientIDs = args.ingredientIDs;
          if (args.stepIDs) recipeToUpdate.stepIDs = args.stepIDs;
          if (args.tasteProfileID) recipeToUpdate.tasteProfileID = args.tasteProfileID;
          if (args.equipment) recipeToUpdate.equipment = args.equipment;
          if (args.qualityTags) recipeToUpdate.qualityTags = args.qualityTags;
          await mongoClient.connect();
          await recipeCollection.updateOne({ _id: new ObjectId(args.id) }, { $set: recipeToUpdate });
          newRecipeList = await recipeCollection.find({}).toArray();
          updated = true;
        } else {
          return {
            success: false,
            message: 'Recipe does not exist',
            recipes: newRecipeList
          }
        }
      } catch (error) {
        updated = false;
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: updated ? true : false,
          message: updated ? 'Recipe updated successfully' : 'Error updating recipe',
          recipes: newRecipeList
        }
      }
    },
    addChefsSpecial: async (_, args, context, info) => {
      if (context.signature) {
        const address = verifyMessage(args.authMessage, context.signature); 
        if (auth.address !== args.userID) {
          throw new AuthenticationError('Not authorized');
        } 
      } else if (context.token && auth.token === '') {
        throw new AuthenticationError('Not authorized');
      } else if (context.noAuth) {
        throw new AuthenticationError('Not authorized');
      }
      let chefsSpecial;
      const newSpecial = {
        recipeID: args.recipeID,
        specialtyTags: args.specialtyTags,
        comments: args.comments,
        userID: args.userID
      };
      try {
        await mongoClient.connect();
        chefsSpecial = await db.collection('chefsSpecial').insertOne(newSpecial);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: chefsSpecial.acknowledged ? true : false,
          message: chefsSpecial.acknowledged ? 'Chef special added successfully' : 'Error adding chef special',
          chefsSpecialID: chefsSpecial.insertedId
        }
      }
    },
    updateChefsSpecial: async (_, args, context, info) => {
      if (type === 'SIGNATURE') {
        const address = verifyMessage(authMessage, signature); 
        if (address !== args.userID) {
          throw new AuthenticationError('Not authorized');
        } 
      } else if (type === 'JWT') {
        if (authMessage.split(' ')[-1] !== token) {
          throw new AuthenticationError('Not authorized');
        }
      } else if (type === 'NONE') {
        throw new AuthenticationError('Not authorized');
      }
      let updated = false;
      let newChefsSpecialID;
      let chefsSpecialToUpdate = {}
      if (db.collection('chefsSpecial').find(chefsSpecial => chefsSpecial.recipeID === args.recipeID)) {
        chefsSpecialToUpdate.recipeID = args.recipeID;
        if (args.specialtyTags) chefsSpecialToUpdate.specialtyTags.push(args.specialtyTags);
          else chefsSpecialToUpdate.specialtyTags = args.specialtyTags;
        if (args.comments) chefsSpecialToUpdate.comments = args.comments.push(args.comments);
          else chefsSpecialToUpdate.comments = args.comments;
        try {
          await mongoClient.connect();
          newChefsSpecialID = await db.collection('chefsSpecial').updateOne({ recipeID: args.recipeID }, { $set: chefsSpecialToUpdate });
        } catch (error) {
          updated = false;
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: updated ? true : false,
            message: updated ? 'Chef special updated successfully' : 'Error updating chef special',
            chefsSpecialID: newChefsSpecialID.upsertedId
          }
        }
      } else {
        return {
          success: false,
          message: 'Chef special does not exist',
          chefsSpecialID: newChefsSpecialID
        }
      }
    },
    deleteChefsSpecial: async (_, args, context, info) => {
      if (context.signature) {
        const address = verifyMessage(args.authMessage, context.signature); 
        if (auth.address !== args.userID) {
          throw new AuthenticationError('Not authorized');
        } 
      } else if (context.token && auth.token === '') {
        throw new AuthenticationError('Not authorized');
      } else if (context.noAuth) {
        throw new AuthenticationError('Not authorized');
      }
      let deleted = false;
      let chefsSpecialList = [];
      if (db.collection('chefsSpecial').find(chefsSpecial => chefsSpecial.recipeCid === args.recipeCid)) {
        try {
          await mongoClient.connect();
          await db.collection('chefsSpecial').deleteOne({ recipeCid: args.recipeCid });
          chefsSpecialList = await db.collection('chefsSpecial').find({recipeCid: args.recipeCid}).toArray();
          deleted = true;
        } catch (error) {
          deleted = false;
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: deleted ? true : false,
            message: deleted ? 'Chef special deleted successfully' : 'Error deleting chef special',
            chefsSpecialList
          }
        }
      } else {
        return {
          success: false,
          message: 'Chef special does not exist',
          chefsSpecialList
        }
      }
    },
    addExternalRecipe: async (_, args, context, info) => {
      if (context.signature) {
        const address = verifyMessage(args.authMessage, context.signature); 
        if (auth.address !== args.userID) {
          throw new AuthenticationError('Not authorized');
        } 
      } else if (context.token && auth.token === '') {
        throw new AuthenticationError('Not authorized');
      } else if (context.noAuth) {
        throw new AuthenticationError('Not authorized');
      }
      let externalRecipeID;
      const newExternalRecipe = {
        name: args.name,
        recipeUrl: args.recipeUrl,
        userID: args.userID,
        notes : args.notes
      };
      try {
        await mongoClient.connect();
        externalRecipeID = await db.collection('externalRecipes').insertOne(newExternalRecipe);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: externalRecipeID.acknowledged ? true : false,
          message: externalRecipeID.acknowledged ? 'External recipe added successfully' : 'Error adding external recipe',
          externalRecipeID: externalRecipeID.insertedId
        }
      }
    },
    addUser: async (_, args, context, info) => {
      if (context.signature) {
        const address = verifyMessage(args.authMessage, context.signature); 
        if (auth.address !== args.userID) {
          throw new AuthenticationError('Not authorized');
        } 
      } else if (context.token && auth.token === '') {
        throw new AuthenticationError('Not authorized');
      } else if (context.noAuth) {
        throw new AuthenticationError('Not authorized');
      }
      let addedUser;
      try {
        await mongoClient.connect();
        const user = await db.collection('users').findOne({ userID: args.userID });
        if (user) {
          await mongoClient.close();
          throw new AuthenticationError('User already exists');
        }
        const newUser = {
          userID: args.userID,
          name: args.name,
          email: args.email,
          imageCid: args.imageCid,
        };
        addedUser = await userCollection.insertOne(newUser);
      } catch (error) {
        await mongoClient.close();
        throw new Error(error);
      } finally {
        await mongoClient.close();
    
        return {
          success: addedUser.acknowledged ? true : false,
          message: addedUser.acknowledged ? 'User added successfully' : 'Error adding user',
          userID: addedUser.insertedId
        }
      }
    },
    updateUser: async (_, args, context, info) => {
      if (context.signature) {
        const address = verifyMessage(args.authMessage, context.signature); 
        if (auth.address !== args.userID) {
          throw new AuthenticationError('Not authorized');
        } 
      } else if (context.token && auth.token === '') {
        throw new AuthenticationError('Not authorized');
      } else if (context.noAuth) {
        throw new AuthenticationError('Not authorized');
      }
      let userToUpdate = {};
      let updatedUser;
      if (db.collection('users').find(user => user.address === args.address)) {
        userToUpdate.userID = args.userID;
        userToUpdate.signature = args.signature;
        userToUpdate.name = args.name;
        userToUpdate.email = args.email;
        userToUpdate.image = args.image;
        try {
          await mongoClient.connect();
          updatedUser = await db.collection('users').updateOne({ userID: args.userID }, { $set: userToUpdate });
        } catch (error) {
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: updatedUser.acknowledged ? true : false,
            message: updatedUser.acknowledged ? 'User updated successfully' : 'Error updating user',
            userID: updatedUser.upsertedId
          }
        }
      } else {
        return {
          success: false,
          message: 'User does not exist',
          userID: args.address
        }
      }
    },
    addRecipeRequest: async (_, args, context, info) => {
      if (context.signature) {
        const address = verifyMessage(args.authMessage, context.signature); 
        if (auth.address !== args.userID) {
          throw new AuthenticationError('Not authorized');
        } 
      } else if (context.token && auth.token === '') {
        throw new AuthenticationError('Not authorized');
      } else if (context.noAuth) {
        throw new AuthenticationError('Not authorized');
      }
      let recipeRequestID;
      const newRecipeRequest = {
        name: args.name,
        description: args.description,
        imageCid: args.imageCid,
        tasteProfileID: args.tasteProfileID,
        nutritionalRequirements: args.nutritionalRequirements,
        dietaryRequirements: args.dietaryRequirements,
        qualityTags: args.qualityTags,
        equipment: args.equipment,
        user: { userID: args.userID },
        createdAt: args.date
      }
      try {
        await mongoClient.connect();
        recipeRequestID = await requestCollection.insertOne(newRecipeRequest);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: recipeRequestID.acknowledged ? true : false,
          message: recipeRequestID.acknowledged ? 'Recipe request added successfully' : 'Error adding recipe request',
          recipeRequestID: recipeRequestID.insertedId
        }
      }
    }
  }
}

module.exports = resolvers;

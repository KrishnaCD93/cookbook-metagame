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
const chefsMetaCollection = db.collection('chefsMeta');
const cookbookCollection = db.collection('cookbook');
const userCollection = db.collection('users');

const { File } = require('nft.storage');

const privateKey = process.env.COOKBOOK_PRIV_KEY;
const editionAddress = process.env.THIRDWEB_EDITION_ADDRESS;
const sdk = ThirdwebSDK.fromPrivateKey(privateKey, 'mumbai');

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
    chefsMetaByUserID: async (_, args, context, info) => {
      await mongoClient.connect();
      const chefsMeta = await chefsMetaCollection.find({ userID: args.userID }).toArray();
      await mongoClient.close();
      return chefsMeta;
    },
    cookbooks: async () => {
      await mongoClient.connect();
      const cookbooks = await cookbookCollection.find({}).toArray();
      await mongoClient.close();
      return cookbooks;
    },
    cookbookByUserID: async (_, args, context, info) => {
      const cookbook = {
        recipes: [],
        ingredients: [],
        steps: [],
        tasteProfiles: [],
        chefsMetas: [],
        externalRecipes: [],
        user: {
          userID: '',
        }
      };
      try {
      await mongoClient.connect();
      cookbook.user.userID = args.userID;
      const recipes = await recipeCollection.find({ userID: args.userID }).toArray();
      for (const recipe of recipes) {
        cookbook.recipes.push(recipe);
        for (const ingredient of recipe.ingredientIDs) {
          const ingredientData = await ingredientCollection.findOne({ _id: new ObjectId(ingredient) });
          cookbook.ingredients.push(ingredientData);
        }
        for (const step of recipe.stepIDs) {
          const stepData = await stepCollection.findOne({ _id: new ObjectId(step) });
          cookbook.steps.push(stepData);
        }
        const tasteProfile = await tasteProfileCollection.findOne({ _id: new ObjectId(recipe.tasteProfileID) });
        cookbook.tasteProfiles.push(tasteProfile);
      }
      cookbook.externalRecipes = await externalRecipeCollection.find({ userID: args.userID }).toArray();
      cookbook.chefsMetas = await chefsMetaCollection.find({ userID: args.userID }).toArray();
    } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return cookbook;
      }
    },
    user: async (_, args, context, info) => {
      if (!context.user) return null;
      await mongoClient.connect();
      const user = await userCollection.findOne({ address: args.address });
      await mongoClient.close();
      return user;
    }
  },
  Mutation: {
    addRecipeNFT: async (_, args, context, info) => {
      const { imageUri, userID, name, description, tasteProfile, signature } = args;
      let nftCid;
      try {
        const file = new File([imageUri], `${name}.jpg`, { type: 'image/jpeg' });
        console.log('file', file);
        const nftMetadata = {
          image: file,
          name: name,
          description: description,
          properties: {
            type: 'recipe',
            chef: userID,
            name: name,
            tasteProfile: {
              salt: tasteProfile[0],
              sweet: tasteProfile[1],
              sour: tasteProfile[2],
              bitter: tasteProfile[3],
              spice: tasteProfile[4],
              umami: tasteProfile[5]
            },
            signature: signature
          }
        }
        // const client = new NFTStorage({ token: nftStorageToken})
        // recipeNFT = await client.store(nftMetadata)
        const metadataWithSupply = {
          nftMetadata,
          supply: 1,
        }
        const tx = await contract.mintTo(userID, metadataWithSupply);
        const receipt = await tx.receipt;
        const tokenId = tx.id;
        nftCid = await tx.data();
        console.log('uploaded NFT', nftCid)
      } catch (error) {
        console.log('error', error)
      } finally {
        return {
          success: recipeNFT? true : false,
          message: recipeNFT? 'Image uploaded successfully' : 'Image upload failed',
          nftCid: contractAddress? contractAddress : null
        }
      }
    },
    addIngredients: async (_, args, context, info) => {
      // if (!args.signature) throw new AuthenticationError('Please sign message.');
      const { names, quantities, nutritions, comments, imageCids, userID } = args;
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
      let addedIngredients;
      try {
        await mongoClient.connect();
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
      // if (!args.signature) throw new AuthenticationError('Please sign message.');
      const { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID } = args;
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
      let addedSteps;
      try {
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
      // if (!args.signature) throw new AuthenticationError('Please sign message.');
      const { salt, sweet, sour, bitter, spice, umami, userID } = args;
      const newTasteProfile = {
        salt: salt,
        sweet: sweet,
        sour: sour,
        bitter: bitter,
        spice: spice,
        umami: umami,
        userID: userID,
      };
      let addedTasteProfile;
      try {
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
      // if (!args.signature) throw new AuthenticationError('Please sign message.');
      const { name, description, imageCid, ingredientIDs, stepIDs, tasteProfileID, qualityTags, equipment, userID, signature, createdAt } = args;
      let addedRecipe;
      const newRecipe = {
        name: name,
        imageCid: imageCid,
        description: description,
        ingredientIDs: ingredientIDs,
        stepIDs: stepIDs,
        qualityTags: qualityTags,
        tasteProfileID: tasteProfileID,
        equipment: equipment,
        userID: userID,
        signature: signature,
        createdAt: createdAt
      };
      try {
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
      if (!args.signature) throw new AuthenticationError('Please sign with Ethereum to delete a recipe.');
      if (recipeCollection.find(recipe => recipe._id === args.id)) {
        try {
          await mongoClient.connect();
          recipeSignature = await recipeCollection.findOne({ id: new ObjectId(args.id) });
          if (recipeSignature.signature === args.signature) {
            await recipeCollection.deleteOne({ id: args.recipeID });
            let newRecipeList = await recipeCollection.find({}).toArray();
            recipes.push(newRecipeList);
            deleted = true;
          } else {
            deleted = false;
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
      } else {
        return {
          success: false,
          message: 'Recipe does not exist',
          recipeID: args.id
        }
      }
    },
    updateRecipe: async (_, args, context, info) => {
      if (!args.signature) throw new AuthenticationError('Please sign with Ethereum to update a recipe.');
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
        if (args.userID) recipeToUpdate.userID = args.userID;
        try {
          await mongoClient.connect();
          await recipeCollection.updateOne({ _id: new ObjectId(args.id) }, { $set: recipeToUpdate });
          newRecipeList = await recipeCollection.find({}).toArray();
          updated = true;
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
      } else {
        return {
          success: false,
          message: 'Recipe does not exist',
          recipes: newRecipeList
        }
      }
    },
    addChefsMeta: async (_, args, context, info) => {
      let chefsMeta;
      const newSpecial = {
        recipeID: args.recipeID,
        specialtyTags: args.specialtyTags,
        comments: args.comments,
        userID: args.userID
      };
      try {
        await mongoClient.connect();
        chefsMeta = await db.collection('chefsMeta').insertOne(newSpecial);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: chefsMeta.acknowledged ? true : false,
          message: chefsMeta.acknowledged ? 'Chef special added successfully' : 'Error adding chef special',
          chefsMetaID: chefsMeta.insertedId
        }
      }
    },
    updateChefsMeta: async (_, args, context, info) => {
      let updated = false;
      let newChefsMetaID;
      let chefsMetaToUpdate = {}
      if (db.collection('chefsMeta').find(chefsMeta => chefsMeta.recipeID === args.recipeID)) {
        chefsMetaToUpdate.recipeID = args.recipeID;
        if (args.specialtyTags) chefsMetaToUpdate.specialtyTags.push(args.specialtyTags);
          else chefsMetaToUpdate.specialtyTags = args.specialtyTags;
        if (args.comments) chefsMetaToUpdate.comments = args.comments.push(args.comments);
          else chefsMetaToUpdate.comments = args.comments;
        try {
          await mongoClient.connect();
          newChefsMetaID = await db.collection('chefsMeta').updateOne({ recipeID: args.recipeID }, { $set: chefsMetaToUpdate });
        } catch (error) {
          updated = false;
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: updated ? true : false,
            message: updated ? 'Chef special updated successfully' : 'Error updating chef special',
            chefsMetaID: newChefsMetaID.upsertedId
          }
        }
      } else {
        return {
          success: false,
          message: 'Chef special does not exist',
          chefsMetaID: newChefsMetaID
        }
      }
    },
    deleteChefsMeta: async (_, args, context, info) => {
      let deleted = false;
      let chefsMetaList = [];
      if (db.collection('chefsMeta').find(chefsMeta => chefsMeta.recipeCid === args.recipeCid)) {
        try {
          await mongoClient.connect();
          await db.collection('chefsMeta').deleteOne({ recipeCid: args.recipeCid });
          chefsMetaList = await db.collection('chefsMeta').find({recipeCid: args.recipeCid}).toArray();
          deleted = true;
        } catch (error) {
          deleted = false;
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: deleted ? true : false,
            message: deleted ? 'Chef special deleted successfully' : 'Error deleting chef special',
            chefsMetaList
          }
        }
      } else {
        return {
          success: false,
          message: 'Chef special does not exist',
          chefsMetaList
        }
      }
    },
    addExternalRecipe: async (_, args, context, info) => {
      if (args.userID === '0x0') throw new AuthenticationError('Cannot add external recipe without a userID');
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
      const { address, name, email, image, signature } = args;
      let addedUser;
      const newUser = {
        address: address,
        signature: signature,
        name: name,
        email: email,
        image: image,
      };
      try {
        await mongoClient.connect();
        addedUser = await db.collection('users').insertOne(newUser);
      } catch (error) {
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
          updatedUser = await db.collection('users').updateOne({ email: args.email }, { $set: userToUpdate });
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
    addContestEntry: async (_, args, context, info) => {
      let contestEntryID;
      const newContestEntry = {
        userID: args.userID,
        recipeID: args.recipeID,
        prompt: args.prompt,
        signature: args.signature,
      };
      try {
        await mongoClient.connect();
        contestEntryID = await db.collection('contestEntries').insertOne(newContestEntry);
      } catch (error) {
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: contestEntryID.acknowledged ? true : false,
          message: contestEntryID.acknowledged ? 'Contest entry added successfully' : 'Error adding contest entry',
          contestEntryID: contestEntryID.insertedId
        }
      }
    }
  }
}

module.exports = resolvers;
const { AuthenticationError } = require('apollo-server');
const { MongoClient } = require('mongodb');

const mongoPassword = process.env.MONGO_DB_PASSWORD;
const mongoURI = `mongodb+srv://cookbook:${mongoPassword}@cluster0.2k2xd.mongodb.net/?retryWrites=true&w=majority`
const mongoClient = new MongoClient(mongoURI);
const db = mongoClient.db('cookbookSocial');

const resolvers = {
  Query: {
    recipes: async () => {
      await mongoClient.connect();
      const recipes = await db.collection('recipes').find({}).toArray();
      await mongoClient.close();
      return recipes;
    },
    recipesByUserID: async (_, args, context, info) => {
      await mongoClient.connect();
      const userRecipes = await db.collection('recipes').find({ userID: args.userID }).toArray();
      await mongoClient.close();
      return userRecipes;
    },
    chefsMetaByRecipeCid: async (_, args, context, info) => {
      await mongoClient.connect();
      const chefsMeta = await db.collection('chefsMeta').find({ recipeCid: args.recipeCid }).toArray();
      await mongoClient.close();
      return chefsMeta;
    },
    cookbooks: async () => {
      await mongoClient.connect();
      const cookbooks = await db.collection('cookbooks').find({}).toArray();
      await mongoClient.close();
      return cookbooks;
    },
    cookbookByUserID: async (_, args, context, info) => {
      await mongoClient.connect();
      const cookbook = await db.collection('cookbooks').find({ userID: args.userID }).toArray();
      await mongoClient.close();
      return cookbook;
    },
    user: async (_, args, context, info) => {
      if (!context.user) return null;
      await mongoClient.connect();
      const user = await db.collection('users').findOne({ address: args.address });
      await mongoClient.close();
      return user;
    }
  },
  Mutation: {
    addRecipe: async (_, args, context, info) => {
      if (!context.user) throw new AuthenticationError('You must be logged in to add a recipe.');
      let added = false;
      let recipeList;
      const recipeCollection = db.collection('recipes');
      const newRecipe = {
        recipeCid: args.recipeCid,
        imageCids: args.imageCids,
        recipeName: args.recipeName,
        description: args.description,
        ingredients: ingredients,
        steps: steps,
        metaQualityTags: args.metaQualityTags,
        equipment: args.equipment,
        userID: args.userID
      };
      try {
        await mongoClient.connect();
        await recipeCollection.insertOne(newRecipe);
        recipeList = await recipeCollection.find({}).toArray();
        added = true
      } catch (error) {
        added = false
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: added ? true : false,
          message: added ? 'Recipe added successfully' : 'Error adding recipe',
          recipeList
        };
      }
    },
    deleteRecipe: async (_, args, context, info) => {
      if (!context.user) throw new AuthenticationError('You must be logged in to delete a recipe.');
      let deleted = false;
      let recipes = [];
      if (db.collection('recipes').find(recipe => recipe.recipeCid === args.recipeCid)) {
        try {
          await mongoClient.connect();
          await db.collection('recipes').deleteOne({ recipeCid: args.recipeCid });
          let newRecipeList = await db.collection('recipes').find({}).toArray();
          recipes.push(newRecipeList);
          deleted = true;
        } catch (error) {
          deleted = false;
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: deleted ? true : false,
            message: deleted ? 'Recipe deleted successfully' : 'Error deleting recipe',
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
    updateRecipe: async (_, args, context, info) => {
      if (!context.user) throw new AuthenticationError('You must be logged in to update a recipe.');
      let updated = false;
      let newRecipeList = [];
      let recipeToUpdate = {}
      if (db.collection('recipes').find(recipe => recipe.recipeCid === args.newRecipeCid)) {
        recipeToUpdate.recipeCid = args.newRecipeCid;
        if (args.imageCids) recipeToUpdate.imageCids = args.imageCids;
        if (args.cookbookAddress) recipeToUpdate.cookbookAddress = args.cookbookAddress;
        if (args.tokenNumber) recipeToUpdate.tokenNumber = args.tokenNumber;
        if (args.recipeName) recipeToUpdate.recipeName = args.recipeName;
        if (args.description) recipeToUpdate.description = args.description;
        if (args.ingredients) recipeToUpdate.ingredients = args.ingredients;
        if (args.steps) recipeToUpdate.steps = args.steps;
        if (args.metaQualityTags) recipeToUpdate.metaQualityTags = args.metaQualityTags;
        if (args.equipment) recipeToUpdate.equipment = args.equipment;
        if (args.userID) recipeToUpdate.userID = args.userID;
        try {
          await mongoClient.connect();
          await db.collection('recipes').updateOne({ recipeCid: args.recipeCid }, { $set: recipeToUpdate });
          newRecipeList = await db.collection('recipes').find({}).toArray();
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
      let added = false;
      let chefsMetaList = [];
      const newSpecial = {
        recipeCid: args.recipeCid,
        specialtyTags: args.specialtyTags,
        comments: args.comments
      };
      try {
        await mongoClient.connect();
        await db.collection('chefsMeta').insertOne(newSpecial);
        chefsMetaList = await db.collection('chefsMeta').find({recipeCid: args.recipeCid}).toArray();
        added = true;
      } catch (error) {
        added = false;
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: added ? true : false,
          message: added ? 'Chef special added successfully' : 'Error adding chef special',
          chefsMetaList
        }
      }
    },
    updateChefsMeta: async (_, args, context, info) => {
      let updated = false;
      let newChefsMetaList = [];
      let chefsMetaToUpdate = {}
      if (db.collection('chefsMeta').find(chefsMeta => chefsMeta.recipeCid === args.recipeCid)) {
        chefsMetaToUpdate.recipeCid = args.recipeCid;
        if (args.specialtyTags) chefsMetaToUpdate.specialtyTags.push(args.specialtyTags);
          else chefsMetaToUpdate.specialtyTags = args.specialtyTags;
        if (args.comments) chefsMetaToUpdate.comments = args.comments.push(args.comments);
          else chefsMetaToUpdate.comments = args.comments;
        try {
          await mongoClient.connect();
          await db.collection('chefsMeta').updateOne({ recipeCid: args.recipeCid }, { $set: chefsMetaToUpdate });
          newChefsMetaList = await db.collection('chefsMeta').find({recipeCid: args.recipeCid}).toArray();
          updated = true;
        } catch (error) {
          updated = false;
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: updated ? true : false,
            message: updated ? 'Chef special updated successfully' : 'Error updating chef special',
            chefsMetaList: newChefsMetaList
          }
        }
      } else {
        return {
          success: false,
          message: 'Chef special does not exist',
          chefsMetaList: newChefsMetaList
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
    addCookbook: async (_, args, context, info) => {
      let added = false;
      let cookbookList = [];
      const newCookbook = {
        recipeCids: args.recipeCids,
        name: args.name,
        description: args.description,
        chefsMeta: args.chefsMeta,
        tags: args.tags,
        tasteProfile: args.tasteProfile,
        userID: args.userID
      };
      try {
        await mongoClient.connect();
        await db.collection('cookbooks').insertOne(newCookbook);
        cookbookList = await db.collection('cookbooks').find({}).toArray();
        added = true;
      } catch (error) {
        added = false;
        throw new Error(error);
      } finally {
        await mongoClient.close();
        return {
          success: added ? true : false,
          message: added ? 'Cookbook added successfully' : 'Error adding cookbook',
          cookbookList
        }
      }
    },
    updateCookbook: async (_, args, context, info) => {
      let updated = false;
      let newCookbookList = [];
      let cookbookToUpdate = {}
      if (db.collection('cookbooks').find(cookbook => cookbook.name === args.name)) {
        cookbookToUpdate.name = args.name;
        if (args.description) cookbookToUpdate.description = args.description;
        if (args.recipeCids) cookbookToUpdate.recipeCids = args.recipeCids;
        if (args.chefsMeta) cookbookToUpdate.chefsMeta = args.chefsMeta;
        if (args.tags) cookbookToUpdate.tags = args.tags;
        if (args.tasteProfile) cookbookToUpdate.tasteProfile = args.tasteProfile;
        if (args.userID) cookbookToUpdate.userID = args.userID;
        try {
          await mongoClient.connect();
          await db.collection('cookbooks').updateOne({ name: args.name }, { $set: cookbookToUpdate });
          newCookbookList = await db.collection('cookbooks').find({}).toArray();
          updated = true;
        } catch (error) {
          updated = false;
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: updated ? true : false,
            message: updated ? 'Cookbook updated successfully' : 'Error updating cookbook',
            cookbookList: newCookbookList
          }
        }
      } else {
        return {
          success: false,
          message: 'Cookbook does not exist',
          cookbookList: newCookbookList
        }
      }
    },
    deleteCookbook: async (_, args, context, info) => {
      let deleted = false;
      let cookbookList = [];
      if (db.collection('cookbooks').find(cookbook => cookbook.name === args.name)) {
        try {
          await mongoClient.connect();
          await db.collection('cookbooks').deleteOne({ name: args.name });
          cookbookList = await db.collection('cookbooks').find({}).toArray();
          deleted = true;
        } catch (error) {
          deleted = false;
          throw new Error(error);
        } finally {
          await mongoClient.close();
          return {
            success: deleted ? true : false,
            message: deleted ? 'Cookbook deleted successfully' : 'Error deleting cookbook',
            cookbookList
          }
        }
      } else {
        return {
          success: false,
          message: 'Cookbook does not exist',
          cookbookList
        }
      }
    }
  }
}

module.exports = resolvers;
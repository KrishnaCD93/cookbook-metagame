const { gql } = require('apollo-server');

const typeDefs = gql`
  type Recipe {
    _id: ID
    recipeCid: String
    cookbookAddress: String
    tokenNumber: Int
    name: String!
    imageCid: String
    description: String
    ingredientIDs: [ID]!
    stepIDs: [ID]!
    tasteProfileID: ID!
    metaQualityTags: String
    equipment: String
    userID: String
    signature: String
    createdAt: String
    updatedAt: String
  }
  type Ingredient {
    _id: ID
    name: String!
    quantity: String
    nutrition: Nutrition
    comments: String
    imageCid: String
    userID: String
  }
  type Nutrition {
    calories: Int
    fat: Int
    protien: Int
    carbs: Int
  }
  type Step {
    _id: ID
    stepName: String!
    action: String!
    trigger: String
    comments: String
    actionImageCid: String
    triggerImageCid: String
    userID: String
  }
  type TasteProfile {
    _id: ID
    salt: Int!
    sweet: Int!
    sour: Int!
    bitter: Int!
    spice: Int!
    umami: Int
    userID: String
  }
  type ChefsMeta {
    _id: ID
    recipeID: ID
    recipeCid: String
    specialtyTags: [String]
    comments: [String]
    signature: String!
  }
  type Cookbook {
    address: String!
    recipeID: ID
    recipeCids: [String]
    name: String!
    description: String
    chefsMetaIDs: [ID]
    tags: [String]
    tasteProfileIDs: [ID]
    user: [User]!
    signature: String!
  }
  type User {
    address: String!
    signature: String!
    name: String
    image: String
    email: String
    recipes: [Recipe]
  }
  type Query {
    recipes: [Recipe]
    recipesByUserID(userID: String!): [Recipe]
    recipeWithData(recipeID: ID!): RecipeDataResponse
    ingredients: [Ingredient]
    ingredientByID(id: ID!): Ingredient
    steps: [Step]
    stepByID(id: ID!): Step
    tasteProfiles: [TasteProfile]
    tasteProfileByID(id: ID!): [TasteProfile]
    tasteProfilesByUserID(userID: String!): [TasteProfile]
    chefsMetaByRecipeCid(recipeCid: String!): ChefsMeta
    cookbooks: [Cookbook]
    cookbookByUserID(userID: String!): Cookbook
    user(address: String!): User
  }
  type RecipeDataResponse {
    recipe: Recipe
    ingredients: [Ingredient]
    steps: [Step]
    tasteProfile: TasteProfile
  }
  type Mutation {
    addRecipeImage(
      imageBlob: String!
      userID: ID!
      recipeID: ID!
      recipeName: String!
      tasteProfile: [Int]!
    ): ImageUploadResponse!
    addIngredients(
      names: [String]!
      quantities: [String]!
      nutritions: [Int]
      comments: [String]
      imageCids: [String]
      userID: String
      signature: String
    ): IngredientResponse!
    addSteps(
      stepNames: [String]
      actions: [String]!
      triggers: [String]
      actionImageCids: [String]
      triggerImageCids: [String]
      comments: [String]
      userID: String
      signature: String
    ): StepResponse!
    addTasteProfile(
      recipeCid: String
      salt: Int!
      sweet: Int!
      sour: Int!
      bitter: Int!
      spice: Int!
      umami: Int
      userID: ID
      signature: String
    ): TasteProfileResponse!
    addRecipe(
      recipeCid: String
      cookbookAddress: String
      tokenNumber: Int
      name: String!
      imageCid: String
      description: String
      ingredientIDs: [ID]!
      stepIDs: [ID]!
      tasteProfileID: ID!
      metaQualityTags: String
      equipment: String
      userID: String
      signature: String
      createdAt: String
    ): RecipeResponse!
    deleteRecipe(
      id: ID!
      signature: String!
    ): RecipeResponse!
    updateRecipe(
      id: ID!
      recipeCid: String
      newRecipeCid: String
      name: String
      imageCid: String
      description: String
      ingredientIDs: [ID]
      stepIDs: [ID]
      metaQualityTags: [String]
      tasteProfileID: ID
      equipment: String
      cookbookToken: String
      userID: String!
      signature: String!
    ): RecipeResponse!
    addChefsMeta(
      recipeCid: String!
      specialtyTags: [String]
      comments: [String]
      signature: String!
    ): ChefsMetaResponse!
    deleteChefsMeta(
      recipeCid: String!
      signature: String!
    ): ChefsMetaResponse!
    updateChefsMeta(
      recipeCid: String!
      specialtyTags: [String]
      comments: [String]
    ): ChefsMetaResponse!
    addCookbook(
      address: String!
      recipeCids: [String]!
      name: String!
      description: String
      userID: String!
      signature: String!
    ): CookbookResponse!
    deleteCookbook(
      address: String!
      signature: String!
    ): CookbookResponse!
    updateCookbook(
      address: String!
      signature: String!
      recipeCids: [String]!
      name: String!
      description: String
    ): CookbookResponse!
    addUser(
      address: String!
      signature: String!
      name: String
      image: String
      email: String
    ): UserResponse!
    deleteUser(
      address: String!
      signature: String!
    ): UserResponse!
    updateUser(
      address: String!
      signature: String!
      name: String
      image: String
      email: String
    ): UserResponse!
  }
  type ImageUploadResponse {
    success: Boolean!
    message: String!
    imageCid: String!
  }
  type RecipeResponse {
    success: Boolean!
    message: String
    recipeID: ID
  }
  type IngredientResponse {
    success: Boolean!
    message: String
    ingredientIDs: [ID]
  }
  type StepResponse {
    success: Boolean!
    message: String
    stepIDs: [ID]
  }
  type TasteProfileResponse {
    success: Boolean!
    message: String
    tasteProfileID: ID
  }
  type ChefsMetaResponse {
    success: Boolean!
    message: String
    chefsMetaID: ID
  }
  type CookbookResponse {
    success: Boolean!
    message: String
    cookbookID: ID
  }
  type UserResponse {
    success: Boolean!
    message: String
    user: User
  }
`;

module.exports = typeDefs;
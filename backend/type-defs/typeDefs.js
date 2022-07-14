const { gql } = require('apollo-server');

const typeDefs = gql`
  type Recipe {
    id: ID
    recipeCid: String
    cookbookAddress: String
    tokenNumber: Int
    name: String!
    imageCid: String
    description: String
    ingredientIDs: [ID]!
    stepIDs: [ID]!
    metaQualityTags: [String]
    tasteProfileID: [ID]!
    equipment: [String]
    userID: [User]!
    signature: String!
    createdAt: String
    updatedAt: String
  }
  type Ingredient {
    id: ID
    name: String!
    quantity: String
    nutrition: Nutrition
    comments: String
    imageCid: String
  }
  type Nutrition {
    calories: Int
    fat: Int
    protien: Int
    carbs: Int
  }
  type Step {
    id: ID
    name: String!
    action: String!
    trigger: String
    comments: String
    actionImageCid: String
    triggerImageCid: String
  }
  type TasteProfile {
    id: ID
    salt: Int!
    sweet: Int!
    sour: Int!
    bitter: Int!
    spice: Int!
  }
  type ChefsMeta {
    id: ID
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
    signature: String
  }
  type User {
    address: String!
    signature: String
    name: String
    image: String
    email: String
    recipes: [Recipe]
  }
  type Query {
    recipes: [Recipe]
    recipesByUserID(userID: String!): [Recipe]
    chefsMetaByRecipeCid(recipeCid: String!): ChefsMeta
    cookbooks: [Cookbook]
    cookbookByUserID(userID: String!): Cookbook
    user(address: String!): User
  }
  type Mutation {
    addIngredients(
      names: [String]!
      quantities: [String]!
      nutritions: [Int]
      comments: [String]
      imageCids: [String]
    ): IngredientResponse!
    addSteps(
      actions: [String]!
      triggers: [String]
      actionImageCids: [String]
      triggerImageCids: [String]
      comments: [String]
    ): StepResponse!
    addTasteProfile(
      recipeID: ID
      recipeCid: String
      salt: Int!
      sweet: Int!
      sour: Int!
      bitter: Int!
      spice: Int!
    ): TasteProfileResponse!
    addRecipe(
      recipeCid: String
      cookbookAddress: String
      tokenNumber: Int
      name: String!
      imageCid: [String]
      description: String
      ingredientIDs: [ID]!
      stepIDs: [ID]!
      metaQualityTags: [String]
      tasteProfile: [Int]!
      equipment: [String]
      userID: String!
      signature: String!
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
      tasteProfile: [Int]
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
  type RecipeResponse {
    success: Boolean!
    message: String
    recipe: Recipe
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
    cookbook: Cookbook
  }
  type UserResponse {
    success: Boolean!
    message: String
    user: User
  }
`;

module.exports = typeDefs;
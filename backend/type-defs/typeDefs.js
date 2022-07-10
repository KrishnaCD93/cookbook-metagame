const { gql } = require('apollo-server');

const typeDefs = gql`
  type Recipe {
    recipeCid: String!
    imageCids: [String]
    cookbookAddress: String
    tokenNumber: Int
    name: String!
    description: String
    ingredients: [Ingredient]
    steps: [Step]
    metaQualityTags: [String]
    tasteProfile: TasteProfile
    equipment: [String]
    userID: [User]!
  }
  type Ingredient {
    name: String!
    quantity: String
    nutrition: Nutrition
    comments: String
  }
  type Nutrition {
    calories: Int
    fat: Int
    protien: Int
    carbs: Int
  }
  type Step {
    type: StepType!
    step: String!
    comments: String
  }
  enum StepType {
    ACTION
    TRIGGER
  }
  type TasteProfile {
    salt: Int!
    sweet: Int!
    sour: Int!
    bitter: Int!
    spice: Int!
  }
  type ChefsMeta {
    recipeCid: String!
    specialtyTags: [String]
    comments: [String]
  }
  type Cookbook {
    address: String!
    recipeCids: [String]!
    name: String!
    description: String
    chefsMeta: [ChefsMeta]
    tags: [String]
    tasteProfile: TasteProfile
    userID: [User]!
  }
  type User {
    address: String!
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
    addRecipe(
      recipeCid: String!
      imageCids: [String]
      recipeName: String!
      cookbookAddress: String
      tokenNumber: Int
      userID: String!
      ingredientIDs: [String]
      stepIDs: [String]
      metaQualityTags: [String]
      equipment: [String]
    ): RecipeResponse!
    deleteRecipe(
      recipeCid: String!
    ): RecipeResponse!
    updateRecipe(
      recipeCid: String!
      newRecipeCid: String!
      imageCids: [String]
      recipeName: String!
      cookbookToken: String
      userID: String!
    ): RecipeResponse!
    addIngredient(
      recipeCid: String!
      name: String!
      quantity: String
      comments: String
    ): IngredientResponse!
    addStep(
      recipeCid: String!
      type: StepType!
      info: String
      comments: String
    ): StepResponse!
    addTasteProfile(
      recipeCid: String!
      salt: Int
      sweet: Int
      sour: Int
      bitter: Int
      spice: Int
    ): TasteProfileResponse!
    addChefsMeta(
      recipeCid: String!
      specialtyTags: [String]
      comments: [String]
    ): ChefsMetaResponse!
    deleteChefsMeta(
      recipeCid: String!
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
    ): CookbookResponse!
    deleteCookbook(
      address: String!
    ): CookbookResponse!
    updateCookbook(
      address: String!
      recipeCids: [String]!
      name: String!
      description: String
    ): CookbookResponse!
    addUser(
      address: String!
      name: String
      image: String
      email: String
    ): UserResponse!
    deleteUser(
      address: String!
    ): UserResponse!
    updateUser(
      address: String!
      name: String
      image: String
      email: String
    ): UserResponse!
  }
  type RecipeResponse {
    success: Boolean!
    message: String
    recipes: [Recipe]
  }
  type IngredientResponse {
    success: Boolean!
    message: String
    ingredients: [Ingredient]
  }
  type StepResponse {
    success: Boolean!
    message: String
    steps: [Step]
  }
  type TasteProfileResponse {
    success: Boolean!
    message: String
    tasteProfile: TasteProfile
  }
  type ChefsMetaResponse {
    success: Boolean!
    message: String
    chefsMeta: ChefsMeta
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
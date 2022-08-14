const { gql } = require('apollo-server');

const typeDefs = gql`
  type Recipe {
    _id: ID
    recipeCid: String
    cookbookAddress: String
    tokenNumber: Int
    name: String!
    imageCid: String
    description: String!
    ingredientIDs: [ID]
    stepIDs: [ID]
    tasteProfileID: ID!
    qualityTags: String
    equipment: String
    userID: String!
    signature: String
    createdAt: String
    updatedAt: String
  }
  type RecipeNFT {
    imageUri: String!
    userID: String!
    name: String!
    description: String!
    tasteProfile: [Int]!
    signature: String!
  }
  type Ingredient {
    _id: ID
    name: String!
    quantity: String
    nutrition: Nutrition
    comments: String
    imageCid: String
    userID: String!
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
    userID: String!
  }
  type TasteProfile {
    _id: ID
    salt: Int!
    sweet: Int!
    sour: Int!
    bitter: Int!
    spice: Int!
    umami: Int
    userID: String!
  }
  type ExternalRecipe {
    _id: ID
    name: String
    recipeUrl: String
    notes: String
    userID: String!
  }
  type ChefsMeta {
    _id: ID
    recipeID: String
    specialtyTags: String
    comments: String
    userID: String!
  }
  type Cookbook {
    address: String
    name: String
    description: String
    recipes: [Recipe]
    ingredients: [Ingredient]
    steps: [Step]
    tasteProfiles: [TasteProfile]
    externalRecipes: [ExternalRecipe]
    chefsMetas: [ChefsMeta]
    user: User!
    signature: String
  }
  type User {
    userID: String! # User's Ethereum address
    signature: String
    name: String
    image: String
    email: String
  }
  type RecipeRequest {
    _id: ID
    name: String!
    description: String!
    imageCid: String
    tasteProfileID: ID!
    nutritionalRequirements: String
    dietaryRequirements: String
    qualityTags: String
    equipment: String
    user: User!
    createdAt: String
    completedOn: String
    signatureMessage: String
  }
  type ContestEntry {
    _id: ID
    contestID: ID
    userID: ID
    recipeID: ID
    prompt: String
    recpieNFTAddress: String
    numVotes: Int
    signature: String
  }
  type Contest {
    _id: ID
    name: String
    description: String
    prompts: [String]
    submissions: [ContestEntry]
    submissionStartDate: String
    submissionEndDate: String
    votingStartDate: String
    votingEndDate: String
    firstPrizeNFTAddresses: [String]
    secondPrizeNFTAddresses: [String]
    thirdPrizeNFTAddresses: [String]
    prizes: [Prize]
  }
  type Prize {
    _id: ID
    name: String
    description: String
    imageCid: String
    contractAddress: String
  }
  type Vote {
    _id: ID
    userID: ID!
    recipeID: ID
    signature: String
  }
  type RecipeData {
    recipe: Recipe
    ingredients: [Ingredient]
    steps: [Step]
    tasteProfile: TasteProfile
  }
  type Query {
    recipes: [Recipe]
    recipeSearch(name: String): [Recipe]
    recipesByUserID(userID: String!): [Recipe]
    recipeWithData(recipeID: ID!): RecipeData
    recipeNFTs: [RecipeNFT]
    ingredients: [Ingredient]
    ingredientByID(id: ID!): Ingredient
    ingredientsByUserID(userID: String!): [Ingredient]
    steps: [Step]
    stepByID(id: ID!): Step
    stepsByUserID(userID: String!): [Step]
    tasteProfiles: [TasteProfile]
    tasteProfileByID(id: ID!): [TasteProfile]
    tasteProfilesByUserID(userID: String!): [TasteProfile]
    chefsMetaByUserID(userID: String!): [ChefsMeta]
    cookbooks: [Cookbook]
    cookbookByUserID(userID: String!): Cookbook
    user(userID: String!): User
    recipeRequestsByUserID(userID: String!): [RecipeRequest]
    recipeRequestByID(id: ID!): RecipeRequest
    recipeRequests: [RecipeRequest]
    contests: [Contest]
  }
  type Mutation {
    addRecipeNFT(
      imageUri: String!
      userID: String!
      name: String!
      description: String
      tasteProfile: [Int]!
      signature: String!
    ): NFTUploadResponse!
    addIngredients(
      names: [String]!
      quantities: [String]!
      nutritions: [Int]
      comments: [String]
      imageCids: [String]
      userID: String!
      signatureMessage: String!
    ): IngredientResponse!
    addSteps(
      stepNames: [String]
      actions: [String]!
      triggers: [String]
      actionImageCids: [String]
      triggerImageCids: [String]
      comments: [String]
      userID: String!
      signatureMessage: String!
    ): StepResponse!
    addTasteProfile(
      recipeCid: String
      salt: Int!
      sweet: Int!
      sour: Int!
      bitter: Int!
      spice: Int!
      umami: Int
      userID: String!
      signatureMessage: String!
    ): TasteProfileResponse!
    addRecipe(
      recipeCid: String
      cookbookAddress: String
      tokenNumber: Int
      name: String!
      imageCid: String
      description: String
      ingredientIDs: [ID]
      stepIDs: [ID]
      tasteProfileID: ID!
      qualityTags: String
      equipment: String
      userID: String!
      signatureMessage: String!
      createdAt: String
    ): RecipeResponse!
    deleteRecipe(
      id: ID!
      signatureMessage: String!
    ): RecipeResponse!
    updateRecipe(
      id: ID!
      name: String
      imageCid: String
      description: String
      ingredientIDs: [ID]
      stepIDs: [ID]
      tasteProfileID: ID
      qualityTags: String
      equipment: String
      cookbookToken: String
      userID: String!
      signatureMessage: String!
    ): RecipeResponse!
    addChefsMeta(
      recipeID: String
      specialtyTags: String
      comments: String
      userID: String!
    ): ChefsMetaResponse!
    deleteChefsMeta(
      recipeID: String!
      signature: String!
    ): ChefsMetaResponse!
    updateChefsMeta(
      recipeID: String!
      specialtyTags: String
      comments: String
    ): ChefsMetaResponse!
    addExternalRecipe(
      name: String
      recipeUrl: String
      userID: String!
      notes: String
      signatureMessage: String
    ): ExternalRecipeResponse
    addUser(
      userID: String!
      signatureMessage: String!
      name: String
      image: String
      email: String
    ): UserResponse!
    deleteUser(
      userID: String!
      signatureMessage: String!
    ): UserResponse!
    updateUser(
      userID: String!
      signatureMessage: String!
      name: String
      image: String
      email: String
    ): UserResponse!
    addRecipeRequest(
      name: String!
      description: String!
      imageCid: String
      tasteProfileID: ID!
      nutritionalRequirements: String
      dietaryRequirements: String
      qualityTags: String
      equipment: String
      userID: String!
      createdAt: String
      signatureMessage: String!
    ): RecipeRequestResponse!
    createContest(
      name: String
      description: String
      prompts: [String]
      submissionStartDate: String
      submissionEndDate: String
      votingStartDate: String
      votingEndDate: String
      prizes: [String]
      signatureMessage: String
    ): ContestResponse
    addContestEntry(
      userID: ID!
      recipeID: ID
      nftCid: String
      prompt: String
      signatureMessage: String
    ): ContestEntryResponse
    addVote(
      userID: ID!
      contestID: ID
      recipeID: ID
      numVotes: Int
      signatureMessage: String
    ): ContestVoteResponse
    addContestWinner(
      userID: ID!
      contestID: ID
      recipeID: ID
      prompt: String
      signatureMessage: String
    ): ContestWinnerResponse
  }
  type NFTUploadResponse {
    success: Boolean!
    message: String!
    nftCid: String! # NFT contract address
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
  type ExternalRecipeResponse {
    success: Boolean!
    message: String
    externalRecipeID: ID
  }
  type UserResponse {
    success: Boolean!
    message: String
    userID: String
  }
  type RecipeRequestResponse {
    success: Boolean!
    message: String
    recipeRequestID: ID
  }
  type ContestResponse {
    success: Boolean
    message: String
    contestID: ID
  }
  type ContestEntryResponse {
    success: Boolean
    message: String
    contestEntryID: ID
  }
  type ContestVoteResponse {
    success: Boolean
    message: String
    contestVoteID: ID
  }
  type ContestWinnerResponse {
    success: Boolean
    message: String
    contestWinnerID: ID
  }
`;

module.exports = typeDefs;
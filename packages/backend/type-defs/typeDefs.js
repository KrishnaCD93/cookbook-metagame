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
    ingredientIDs: [ID]!
    stepIDs: [ID]!
    tasteProfileID: ID!
    qualityTags: String
    equipment: String
    userID: String
    signature: String
    createdAt: String
    updatedAt: String
  }
  type RecipeNFT {
    imageUri: String!
    userID: ID!
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
    address: String
    name: String!
    description: String
    recipeIDs: [ID]
    ingredientIDs: [ID]
    stepIDs: [ID]
    tasteProfileIDs: [ID]
    chefsMetaIDs: [ID]
    user: User!
    signature: String!
  }
  type User {
    userID: String! # This is the user's Ethereum address
    signature: String!
    name: String
    image: String
    email: String
    recipes: [Recipe]
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
  type Query {
    recipes: [Recipe]
    recipesByUserID(userID: String!): [Recipe]
    recipeWithData(recipeID: ID!): RecipeDataResponse
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
    chefsMetaByRecipeCid(recipeCid: String!): ChefsMeta
    cookbooks: [Cookbook]
    cookbookByUserID(userID: String!): Cookbook
    user(userID: String!): User
    contests: [Contest]
  }
  type RecipeDataResponse {
    recipe: Recipe
    ingredients: [Ingredient]
    steps: [Step]
    tasteProfile: TasteProfile
  }
  type Mutation {
    addRecipeNFT(
      imageUri: String!
      userID: ID!
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
      qualityTags: String
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
      signature: String!
    ): RecipeResponse!
    addChefsMeta(
      cookbookID: String!
      specialtyTags: [String]
      comments: [String]
      signature: String
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
      address: String
      name: String!
      description: String
      recipeIDs: [String]!
      ingredientIDs: [String]
      stepIDs: [String]
      tasteProfileIDs: [String]
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
      recipeIDs: [String]!
      ingredientIDs: [String]
      stepIDs: [String]
      tasteProfileIDs: [String]
      name: String!
      description: String
    ): CookbookResponse!
    addUser(
      userID: String!
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
      userID: String!
      signature: String!
      name: String
      image: String
      email: String
    ): UserResponse!
    createContest(
      name: String
      description: String
      prompts: [String]
      submissionStartDate: String
      submissionEndDate: String
      votingStartDate: String
      votingEndDate: String
      prizes: [String]
      signature: String
    ): ContestResponse
    addContestEntry(
      userID: ID
      recipeID: ID
      recipeNFTAddress: String
      prompt: String
      signature: String
    ): ContestEntryResponse
    addVote(
      userID: ID
      contestID: ID
      recipeID: ID
      numVotes: Int
      signature: String
    ): ContestVoteResponse
    addContestWinner(
      userID: ID
      contestID: ID
      recipeID: ID
      prompt: String
      signature: String
    ): ContestWinnerResponse
  }
  type NFTUploadResponse {
    success: Boolean!
    message: String!
    nftCid: String!
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
    userID: String
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
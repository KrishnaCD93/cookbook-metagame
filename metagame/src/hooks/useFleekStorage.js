import fleek from '@fleekhq/fleek-storage-js'

const useFleekStorage = () => {
  const fleekStorageKey = process.env.REACT_APP_FLEEK_STORAGE_KEY
  const fleekStorageSecret = process.env.REACT_APP_FLEEK_STORAGE_SECRET
  // List all files for the current user
  async function listFiles() {
    const input = {
      apiKey: fleekStorageKey,
      apiSecret: fleekStorageSecret,
      getOptions: [
        // 'data',
        'bucket',
        'key',
        'hash',
        'publicUrl'
      ],
    };
    try {
      const result = await fleek.listFiles(input);
      return result;
    } catch (error) {
      console.error(error);
    }
  };

  // Get all data for a user
  async function fleekStorageGet(key) {
    try {
    const myRecipe = await fleek.get({
      apiKey: fleekStorageKey,
      apiSecret: fleekStorageSecret,
      key: key,
      getOptions: [
        'key'
      ],
    })
    return myRecipe
    } catch (error) {
      console.error(error);
    }
  }

  // Get data from hash
  async function fleekStorageGetByHash(hash) {
    const input = { hash };
    try {
      const result = await fleek.getFileFromHash(input);
      return result
    } catch (error) {
      console.error(error);
    }
  }

  // Upload recipe to Fleek Storage in the user's bucket
  // @param recipe: { userId, cookbookId, name, recipeImageURL, description, ingredients, steps, metaQualityTags, equipment }
  async function fleekStorageUploadRecipeData(recipe){
    const data = JSON.stringify(recipe)
    const input = {
      apiKey: fleekStorageKey,
      apiSecret: fleekStorageSecret,
      key: `${recipe.userId}/${recipe.cookbookId}/${recipe.name}`,
      ContentType: 'application/json',
      data: data,
    }
    try {
      const upload = await fleek.upload(input)
      return upload
    } catch (error) {
      console.log('error: ', error)
    }
  }

  // Upload images in the recipe to the fleek storage's recipe bucket
  // @param imageInfo: { imageName, type } - carries the image placement info and location in recipe
  // @param image - the image to upload
  // @param recipeName - the name of the recipe
  // @param userId - user account data
  // @param cookbookId - the id of the cookbook token
  async function fleekStorageUploadRecipeImage(imageInfo, image, recipeName, userId, cookbookId){
    console.log('uploading image')
    let data = image
    let input = {
      apiKey: fleekStorageKey,
      apiSecret: fleekStorageSecret,
      key: `${userId}/${cookbookId}/${recipeName}/images/${imageInfo.type}/${imageInfo.name}`,
      ContentType: data.type,
      data: data,
    }
    try {
      let upload = await fleek.upload(input)
      console.log('upload: ', upload)
      return upload
    } catch (error) {
      console.log('error: ', error)
    }
  }

  return [listFiles, fleekStorageGet, fleekStorageGetByHash, fleekStorageUploadRecipeData, fleekStorageUploadRecipeImage]
}

export default useFleekStorage
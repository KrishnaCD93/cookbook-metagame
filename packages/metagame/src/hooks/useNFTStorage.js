import { NFTStorage, File } from 'nft.storage'

const nftStorageToken = process.env.REACT_APP_NFT_STORAGE_API_KEY

const useNFTStorage = () => {

  // @param {blob} image - image to upload
  // @param {string} userID - userID of the user who is uploading the image
  // @param {string} recipeName - name of the recipe
  // @param {int} tasteProfile - taste profile of the recipe: salt, sweet, sour, bitter, spice, umami
  const uploadRecipeImage = async (props) => {
    console.log('uploadRecipeImage', props);  
    const { image, userID, recipeName, tasteProfile } = props;
    const type = image.type;
    try {
      const content = new Blob([image], { type });
      const file = new File([content], `${recipeName}.png`, { type })
      console.log('type', type);
      console.log('blob', content);
      console.log('file', file);
      const nft = {
        image: file,
        name: recipeName,
        description: `${recipeName} recipe image`,
        properties: {
          type: 'recipe',
          chef: userID,
          recipeName: recipeName,
          tasteProfile: {
            salt: tasteProfile.salt,
            sweet: tasteProfile.sweet,
            sour: tasteProfile.sour,
            bitter: tasteProfile.bitter,
            spice: tasteProfile.spice,
            umami: tasteProfile.umami
          }
        }
      }
      const client = new NFTStorage({ token: nftStorageToken})
      const recipeImage = await client.store(nft)
      console.log('uploaded image', recipeImage)
      return recipeImage
    } catch (error) {
      console.log('error', error)
    }
  }
  return [uploadRecipeImage]
}

export default useNFTStorage;
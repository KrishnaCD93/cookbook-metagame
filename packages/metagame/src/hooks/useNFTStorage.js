import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import Resizer from 'react-image-file-resizer';
import { File } from 'nft.storage';

const useNFTStorage = () => {

  const uploadRecipeNFT = async (props) => {
    console.log('uploadRecipeNFT', props);
    const { image, userID, name, description, tasteProfile, signer } = props;
    const sdk = ThirdwebSDK.fromSigner(signer, 'mumbai')
    const contractAddress = await sdk.deployer.deployEdition({
      name: `${name} NFT`,
      primary_sale_recipient: userID,
    });
    const contract = sdk.getEdition(contractAddress);
    contract.royalties.setDefaultRoyaltyInfo({
      seller_fee_basis_points: 100, // 1%
      fee_recipient: "0x7B9C880E5118A96Eeb6734E7f6C3f17f7fa2EEE2"
    });
    const tasteProfileArray = [];
    tasteProfileArray[0] = parseInt(tasteProfile.salt);
    tasteProfileArray[1] = parseInt(tasteProfile.sweet);
    tasteProfileArray[2] = parseInt(tasteProfile.sour);
    tasteProfileArray[3] = parseInt(tasteProfile.bitter);
    tasteProfileArray[4] = parseInt(tasteProfile.spice);
    tasteProfileArray[5] = parseInt(tasteProfile.umami);
    const resizeFile = (file) =>
      new Promise((resolve) => {
        Resizer.imageFileResizer(
          file,
          1080,
          1080,
          "JPEG",
          100,
          0,
          (uri) => {
            resolve(uri);
          },
          "base64"
        );
      });
    const imageUri = await resizeFile(image);
    const file = new File([imageUri], `${name}.jpg`, { type: 'image/jpeg' });
    const metadata = {
      image: file,
      name: name,
      description: description,
      properties: [
        {
          display_type: 'number',
          trait_type: 'salt',
          value: tasteProfileArray[0]
        },
        {
          display_type: 'number',
          trait_type: 'sweet',
          value: tasteProfileArray[1]
        },
        {
          display_type: 'number',
          trait_type: 'sour',
          value: tasteProfileArray[2]
        },
        {
          display_type: 'number',
          trait_type: 'bitter',
          value: tasteProfileArray[3]
        },
        {
          display_type: 'number',
          trait_type: 'spice',
          value: tasteProfileArray[4]
        },
        {
          display_type: 'number',
          trait_type: 'umami',
          value: tasteProfileArray[5]
        }
      ]
    }
    const metadataWithSupply = {
      metadata,
      supply: 1,
    }
    const tx = await contract.mintTo(userID, metadataWithSupply);
    const receipt = tx.receipt;
    const tokenId = tx.id;
    const nftCid = await tx.data();
    console.log('receipt', receipt);
    console.log('tokenId', tokenId);
    console.log('uploaded NFT', nftCid);
    return contractAddress;
  }
  return [uploadRecipeNFT]
}

export default useNFTStorage;
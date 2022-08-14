import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import Resizer from 'react-image-file-resizer';
import { File } from 'nft.storage';

// TODO: Fix NFT upload, broken on the last step of the upload process.

const cloudinaryUploadEndpoint = 'https://api.cloudinary.com/v1_1/cookbook-social/auto/upload';

const useStorage = () => {

  const uploadRecipeNFT = async (props) => {
    console.log('uploadRecipeNFT', props);
    const { image, userID, name, description, tasteProfile, signer } = props;
    const sdk = ThirdwebSDK.fromSigner(signer, 'polygon')
    const contract = sdk.getEdition('0x66B1733805cbe2307C657c5A68da8835469096Da');
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
    const nftMetadata = {
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
    // const metadataWithSupply = {
    //   metadata,
    //   supply: 1,
    // }
    const startTime = new Date();
    const endTime = new Date(Date.now() + 60 * 60 * 24 * 1000);
    const payload = {
      metadata: nftMetadata, // The NFT to mint
      to: userID, // Who will receive the NFT (or AddressZero for anyone)
      quantity: 1, // the quantity of NFTs to mint
      price: 0.0, // the price per NFT
      currencyAddress: "0x0000000000000000000000000000000000001010", // the currency to pay with
      mintStartTime: startTime, // can mint anytime from now
      mintEndTime: endTime, // to 24h from now
      royaltyRecipient: "0x7B9C880E5118A96Eeb6734E7f6C3f17f7fa2EEE2", // custom royalty recipient for this NFT
      royaltyBps: 100, // custom royalty fees for this NFT (in bps)
      primarySaleRecipient: userID, // custom sale recipient for this NFT
    };

    const signedPayload = await contract.signature.generate(payload);
    const tx = await contract.signature.mint(signedPayload);
    const receipt = tx.receipt;
    const tokenId = tx.id;
    const nftCid = await tx.data();
    console.log('receipt', receipt);
    console.log('tokenId', tokenId);
    console.log('uploaded NFT', nftCid);
    return nftCid;
  }

  const uploadRecipeImage = async (props) => {
    try {
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
        const resizedFile = await resizeFile(props);
        const formData = new FormData();
        formData.append('file', resizedFile);
        formData.append('upload_preset', 'jvcboirw');
        const options = {
          method: 'POST',
          body: formData
        };
        const response = await fetch(cloudinaryUploadEndpoint, options);
        const data = await response.json();
        console.log('uploadRecipeImage', data);
        return data.public_id;
      } catch (error) {
        console.log('uploadRecipeImage error', error);
      }
    }

  return [uploadRecipeNFT, uploadRecipeImage]
}

export default useStorage;
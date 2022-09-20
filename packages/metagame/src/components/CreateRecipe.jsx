import { IconButton, Input, Tooltip, Container, CSSReset, Box, Text, Grid, GridItem, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Flex, Checkbox, useColorModeValue } from "@chakra-ui/react";
import { Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from '@chakra-ui/react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { FormErrorMessage, FormLabel, FormControl, Button } from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import { FaImage } from 'react-icons/fa';
import useApolloMutations from "../hooks/useApolloMutations";
import useStorage from "../hooks/useStorage";
import { useAccount, useSignMessage } from "wagmi"; 
import { useSigner } from 'wagmi';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import GetIngredients from "./create-recipe-container/Ingredients";
import GetSteps from "./create-recipe-container/Steps";

// TODO: Upload recipe NFT

const CreateRecipe = ({ isOpen, onClose }) => {
  const [uploadIngredients, uploadSteps, uploadTasteProfile, uploadRecipe] = useApolloMutations();
  const [uploadRecipeNFT, uploadRecipeImage] = useStorage();
  const [uploading, setUploading] = useState(false);
  const [userID, setUserID] = useState('');
  const [imageCid, setimageCid] = useState('');
  const [mintNFT, setMintNFT] = useState(false);
  const { handleSubmit, register, control, clearErrors, formState: { errors, isSubmitting } } = useForm({ mode: 'onChange', reValidateMode: 'onSubmit'});
  const toast = useToast()
  const { isConnected, address: accountInfo } = useAccount();
  const { data: signer } = useSigner();
  const { signMessageAsync } = useSignMessage()
  
  // Upload the ingredients to the database and return database ID, return null is user's wallet is not connected
  // @param ingredients: array of ingredients from the form. Includes names, quantities, comments, image IDs, and signature message
  async function addIngredients(ingredients, signatureMessage) {
    if (!isConnected) return null;
    const names = [];
    const quantities = [];
    const comments = [];
    const imageCids = [];
    ingredients.forEach(async (ingredient, index) => {
      if (!ingredient.name) return;
      names[index] = ingredient.name;
      quantities[index] = ingredient.quantity;
      comments[index] = ingredient.comments;
      if (ingredient.image[0]) {
        imageCids[index] = await uploadRecipeImage(ingredient.image[0]);
      } else if (!ingredient.image[0]) {
        imageCids[index] = ''
      }
    })
    const ingredientList = { names, quantities, comments, imageCids, userID, signatureMessage };
    const addedIngredients = await uploadIngredients(ingredientList);
    console.log(addedIngredients);
    return addedIngredients;
  }
  
  // Upload the steps to the database and return database ID, return null is user's wallet is not connected
  // @param steps: array of steps from the form, includes actions, action image ID, triggers, trigger image IDs, and comments
  async function addSteps(steps, signatureMessage) {
    console.log(steps);
    const stepNames = [];
    const actions = [];
    const triggers = [];
    const actionImageCids = [];
    const triggerImageCids = [];
    const comments = [];
    steps.forEach(async (step, index) => {
      if (!step.action) return;
      stepNames[index] = step.stepName;
      actions[index] = step.action;
      triggers[index] = step.trigger;
      comments[index] = step.comments;
      if (step.actionImage[0]) {
        actionImageCids[index] = await uploadRecipeImage(step.actionImage[0]);
      } else if (!step.actionImage[0]) {
        actionImageCids[index] = ''
      }
      if (step.triggerImage[0]) {
        triggerImageCids[index] = await uploadRecipeImage(step.triggerImage[0]);
      } else if (!step.triggerImage[0]) {
        triggerImageCids[index] = ''
      }
    })
    const stepList = { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID, signatureMessage };
    const addedSteps = await uploadSteps(stepList);
    console.log(addedSteps);
    return addedSteps;
  }
  
  // Upload the taste profile to the database and return database ID, return null is user's wallet is not connected
  // @param tasteProfile: taste profile of the recipe. Salt, sweet, sour, bitter, spice, umami.
  async function addTasteProfile(tasteProfile, signatureMessage) {
    if (!isConnected) return null;
    const tasteProfileData = {
      salt: tasteProfile.salt,
      sweet: tasteProfile.sweet,
      sour: tasteProfile.sour,
      bitter: tasteProfile.bitter,
      spice: tasteProfile.spice,
      umami: tasteProfile.umami,
      userID: userID,
      signatureMessage: signatureMessage
    }
    const addedTasteProfile = await uploadTasteProfile(tasteProfileData);
    console.log(addedTasteProfile);
    return addedTasteProfile;
  }
  
  // Upload the recipe to the database and return database ID, return null is user's wallet is not connected
  // @param recipeData: recipe object from the form. Includes name, description, quality tags, and equipment
  async function addRecipe(recipeData, ingredientIDs, stepIDs, tasteProfileID, date, signatureMessage) {
    const recipe = {
      name: recipeData.name,
      imageCid: imageCid,
      description: recipeData.description,
      ingredientIDs: ingredientIDs,
      stepIDs: stepIDs,
      tasteProfileID: tasteProfileID,
      qualityTags: recipeData.qualityTags,
      equipment: recipeData.equipment,
      userID: userID,
      createdAt: date,
      signatureMessage: signatureMessage,
    }
    const uploadedRecipe = await uploadRecipe(recipe);
    console.log(uploadedRecipe);
    return uploadedRecipe;
  }
  
  // Upload the recipe NFT to the database and return NFT content address, return null is user's wallet is not connected
  // @param recipeData: recipe name, description, image, and taste profile
  async function createNFT(recipeData) {
    if (!signer) return null;
    if (recipeData.image && mintNFT) {
      const nftUploadData = { 
        userID, 
        name: recipeData.name, 
        description: recipeData.description, 
        tasteProfile: recipeData.tasteProfile, 
        image: recipeData.image,
        signer 
      }
      const nftCid = await uploadRecipeNFT(nftUploadData);
      return nftCid;
    }
    return null;
  }

  useEffect(() => {
    if (accountInfo) {
      setUserID(accountInfo);
    }
  } , [accountInfo]);
  
  // Handle form submission and upload recipe to the database
  const onSubmit = async (data) => {
    setUploading(true)
    console.log(data);
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Ethereum wallet to authenticate your recipe submission.",
        status: "error",
        duration: 9000,
        isClosable: true,
      })
      return;
    }
    const date = new Date().toISOString();
    const signatureMessage = `Create recipe ${data.name} on ${date} by ${accountInfo}`;
    const signData = await signMessageAsync({ message: signatureMessage });
    localStorage.setItem('signature', signData);
    console.log('userID', userID);
    console.log('signdata', signData);
    if (data.recipeImage[0]) {
      const imageData = await uploadRecipeImage(data.recipeImage[0]);
      setimageCid(imageData);
    }
    console.log(data.recipeImage[0], imageCid);
    const uploadedIngredients = await addIngredients(data.ingredients, signatureMessage);
    const ingredientIDs = uploadedIngredients.ingredientIDs;
    if (uploadedIngredients.success) {
      toast({
        title: 'Ingredients added',
        status: 'success',
        duration: 1000,
      })
    } else {
      toast({
        title: 'Ingredients upload error',
        status: 'error',
        duration: 1000,
      })
    }
    const uploadedSteps = await addSteps(data.steps, signatureMessage);
    const stepIDs = uploadedSteps.stepIDs;
    if (uploadedSteps.success) {
      toast({
        title: 'Steps added',
        status: 'success',
        duration: 1000,
      })
    } else {
      toast({
        title: 'Step upload error',
        status: 'error',
        duration: 1000,
      })
    }
    const uploadedTasteProfile = await addTasteProfile(data.tasteProfile, signatureMessage);
    const tasteProfileID = uploadedTasteProfile.tasteProfileID;
    if (uploadedTasteProfile.success) {
      toast({
        title: 'Taste profile added',
        status: 'success',
        duration: 1000,
      })
    } else {
      toast({
        title: 'Taste profile upload error',
        status: 'error',
        duration: 1000,
      })
    }
    const recipeData = { name: data.name, description: data.description, qualityTags: data.qualityTags, equipment: data.equipment };
    const uploadedRecipe = await addRecipe(recipeData, ingredientIDs, stepIDs, tasteProfileID, date, signatureMessage);
    if (uploadedRecipe.success && !mintNFT) {
      console.log('recipeID', uploadedRecipe.recipeID);
      toast({
        title: 'Recipe uploaded successfully!',
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
      onClose();
    } else if (!uploadedRecipe.succes) {
      toast({
        title: 'Recipe upload failed, please try again.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    } else if (uploadedRecipe.success && mintNFT) {
      const nftData = { name: data.name, description: data.description, image: data.recipeImage[0], tasteProfile: data.tasteProfile };
      const nftCid = await createNFT(nftData);
      if (nftCid) {
        toast({
          title: 'NFT minted successfully!',
          status: 'success',
          duration: 9000,
          isClosable: true,
        })
      } else if (!nftCid) {
        toast({
          title: 'NFT mint failed, please try again.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      }
    }
    onClose();
  }

  const boxTextColor = useColorModeValue('#3c4751', '#c9b68e')
  const boxColor = useColorModeValue('#c9b68e', '#3c4751')

  return (
    <>
    <CSSReset />
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Recipe</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormProvider {...{ handleSubmit, control, clearErrors, register, errors, isSubmitting }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl as='fieldset' isDisabled={uploading}>
                <Accordion defaultIndex={[0, 1, 2, 3]} allowMultiple>
                  <AccordionItem>
                    <h2><AccordionButton bg={(errors && (errors.name || errors.description)) ? 'red.500' : boxColor}>
                      <Box flex='1' textAlign='left' color={boxTextColor}>
                        Add Recipe Information
                      </Box>
                      <AccordionIcon />
                    </AccordionButton></h2>
                    <AccordionPanel>
                      <FormLabel htmlFor="name">
                        <GetRecipeName />
                      </FormLabel>
                      <FormLabel htmlFor="description">
                        <GetDescription />
                      </FormLabel>
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <h2><AccordionButton bg={(errors?.ingredients) ? 'red.500' : boxColor}>
                      <Box flex='1' textAlign='left' color={boxTextColor}>
                        Add Ingredients
                      </Box>
                      <AccordionIcon />
                    </AccordionButton></h2>
                    <AccordionPanel>
                      <FormLabel htmlFor="ingredients">
                        <GetIngredients 
                          useFormContext={useFormContext} 
                          boxColor={boxColor} 
                          boxTextColor={boxTextColor} 
                        />
                      </FormLabel>
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <h2><AccordionButton bg={(errors?.steps) ? 'red.500' : boxColor}>
                      <Box flex='1' textAlign='left' color={boxTextColor}>
                        Add Steps
                      </Box>
                      <AccordionIcon />
                    </AccordionButton></h2>
                      <AccordionPanel>
                        <FormLabel htmlFor="steps">
                          <GetSteps 
                            useFormContext={useFormContext} 
                            boxColor={boxColor} 
                            boxTextColor={boxTextColor} 
                          />
                        </FormLabel>
                      </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <h2><AccordionButton bg={(errors?.tasteProfile) ? 'red.500' : boxColor}>
                      <Box flex='1' textAlign='left' color={boxTextColor}>
                        Add Recipe Tags
                      </Box>
                      <AccordionIcon />
                    </AccordionButton></h2>
                    <AccordionPanel>
                      <FormLabel htmlFor="tasteProfile">
                        <GetTasteProfile />
                      </FormLabel>
                      <FormLabel htmlFor="equipment">
                        <GetEquipment />
                      </FormLabel>
                      <FormLabel htmlFor="qualityTags">
                        <GetQualityTags />
                      </FormLabel>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
                {/* <FormLabel htmlFor="mintNFT">
                  <GetMintNFT setMintNFT={setMintNFT} />
                </FormLabel> */}
              </FormControl>
              {!accountInfo ? <Button w='100%'><ConnectButton label="Login With Wallet" /></Button> : 
              <Button mt={4} isLoading={isSubmitting} type='submit' w='100%'>
                Create Recipe
              </Button>}
            </form>
          </FormProvider>
        </ModalBody>
      </ModalContent>
    </Modal>
    </>
  )
}

// Function to get recipe name
function GetRecipeName() {
  const { register, errors } = useFormContext();
  const { ref, onChange, ...fields } = register('recipeImage')
  const hiddenFileInput = useRef(null);
  const [imageName, setImageName] = useState(null);
  const imageUpload = event => { 
    hiddenFileInput.current?.click();
  }

  return (
    <Container p={2} m={2} centerContent>
    <Text align='center'>Recipe Name*</Text>
    <Container p={2} m={2} centerContent>
      <Tooltip label="Give your recipe a name.">
        <Input py={2} px={2} isInvalid={errors.name}
        {...register('name', {required: 'Give your recipe a name'})} />
      </Tooltip>
      <FormErrorMessage>
        {errors.name && errors.name.message}
      </FormErrorMessage>
    </Container>
    <IconButton icon={<FaImage />} onClick={imageUpload}
      border='1px' />
    <Flex>
      <Input type={'file'} style={{ display: 'none' }} accept='image/jpeg' {...fields} 
        onChange={(event) => {
          onChange(event)
          setImageName(event.target.files[0].name)
        }}
        ref={(instance) => {
          ref(instance)
          hiddenFileInput.current = instance
        }} />
      {imageName &&  <Text>{imageName}</Text>}
    </Flex>
    </Container>
  )
}

// Function to get the recipe description
function GetDescription() {
  const { register, errors } = useFormContext();
  return (
    <Container p={2} m={2} centerContent>
    <Text align='center'>Description*</Text>
    <Container p={2} m={2} centerContent>
      <Tooltip label="Add a short description of the dish.">
        <Input py={2} px={2} isInvalid={errors.description}
          {...register('description', {required: 'Add a short description of the dish'})} />
      </Tooltip>
        <FormErrorMessage>
          {errors.description && errors.description.message}
        </FormErrorMessage>
    </Container>
    </Container>
  )
}

// Function to get the taste profile for the recipe
function GetTasteProfile() {
  const { register, errors } = useFormContext();
  
  function GetSaltRating() {
    return (
      <>
      <Tooltip label="How salty is this recipe? 0 = not salty, 5 = very salty">
        <Input py={2} px={2} type='number' placeholder='Salt Rating 0-5, eg. 1' isInvalid={errors.tasteProfile?.salt}
          {...register('tasteProfile.salt', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.salt?.message && (
        <FormErrorMessage>
        {errors.tasteProfile.salt?.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSweetRating() {
    return (
      <>
      <Tooltip label="How sweet is this recipe? 0 = not sweet, 5 = very sweet">
        <Input py={2} px={2} type='number' placeholder='Sweet Rating 0-5, eg. 2' isInvalid={errors.tasteProfile?.sweet}
          {...register('tasteProfile.sweet', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.sweet?.message && (
        <FormErrorMessage>
        {errors.tasteProfile.sweet?.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSourRating() {
    return (
      <>
      <Tooltip label="How sour is this recipe? 0 = not sour, 5 = very sour">
        <Input py={2} px={2} type='number' placeholder='Sour Rating 0-5, eg. 3' isInvalid={errors.tasteProfile?.sour}
          {...register('tasteProfile.sour', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.sour?.message && (
        <FormErrorMessage>
        {errors.tasteProfile.sour?.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetBitterRating() {
    return (
      <>
      <Tooltip label="How bitter is this recipe? 0 = not bitter, 5 = very bitter">
        <Input py={2} px={2} type='number' placeholder='Bitter Rating 0-5, eg. 4' isInvalid={errors.tasteProfile?.bitter}
          {...register('tasteProfile.bitter', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.bitter?.message && (
        <FormErrorMessage>
        {errors.tasteProfile.bitter?.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSpiceRating() {
    return (
      <>
      <Tooltip label="How spicy is this recipe? 0 = not spicy, 5 = very spicy">
        <Input py={2} px={2} type='number' placeholder='Spice Rating 0-5, eg. 5' isInvalid={errors.tasteProfile?.spice}
          {...register('tasteProfile.spice', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.spice?.message && (
        <FormErrorMessage>
        {errors.tasteProfile.spice?.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetUmamiRating() {
    return (
      <>
      <Tooltip label="How umami is this recipe? 0 = not umami, 5 = very umami">
        <Input py={2} px={2} type='number' placeholder='Umami Rating 0-5, eg. 0' isInvalid={errors.tasteProfile?.umami}
          {...register('tasteProfile.umami', {min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.umami?.message && (
        <FormErrorMessage>
        {errors.tasteProfile.umami?.message}
      </FormErrorMessage>)}
      </>
    )
  }
  return (
    <Container p={2} m={2} centerContent>
      <Text align='center'>Taste Profile*</Text>
      <Grid templateColumns={'repeat(auto-fit, minmax(200px, 1fr))'} gap={2} p={2} m={2}>
        <GridItem>
          <Text align='center'>Salt</Text>
          <GetSaltRating />
        </GridItem>
        <GridItem>
          <Text align='center'>Sweet</Text>
          <GetSweetRating />
        </GridItem>
        <GridItem>
          <Text align='center'>Sour</Text>
          <GetSourRating />
        </GridItem>
        <GridItem> 
          <Text align='center'>Bitter</Text>
          <GetBitterRating />
        </GridItem>
        <GridItem>
          <Text align='center'>Spice</Text>
          <GetSpiceRating />
        </GridItem>
        <GridItem>
          <Text align='center'>Umami</Text>
          <GetUmamiRating />
        </GridItem>
      </Grid>
    </Container>
  )
}

// Function to get the equipment used in the recipe
function GetEquipment() {
  const { register } = useFormContext();
  
  return (
    <Container p={2} m={2} centerContent>
      <Text align='center'>Equipment</Text>
      <Tooltip label="List the equipment used, separated by commas.">
        <Input py={2} px={2} placeholder='Equipment, eg. oven, pot, pan'
        {...register('equipment')} />
      </Tooltip>
    </Container>
  )
}

// Function to get the quality tags of the recipe
function GetQualityTags() {
  const { register } = useFormContext();

  return (
    <Container p={2} m={2} centerContent>
      <Text align='center'>Quality Tags</Text>
      <Tooltip label="What're the qualities of this recipe? How does this recipe taste? What other recipes does it work well with?">
        <Input py={2} px={2} placeholder='Quality Tags, eg. easy, tasty, serve with rice'
          {...register('qualityTags')} />
      </Tooltip>
    </Container>
  )
}

// Function to check whether the user wants to mint an NFT
function GetMintNFT({ setMintNFT }) {
  return (
    <Container p={2} m={2} centerContent>
      <Text mb={2} align='center'>Mint NFT</Text>
      <Tooltip label="Do you want to mint an NFT of the recipe?">
        <Checkbox
          label="Mint NFT"
          onChange={(e) => setMintNFT(e.target.checked)}
        />
      </Tooltip>
    </Container>
  )
}

export default CreateRecipe;
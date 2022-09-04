import { EditablePreview, useColorModeValue, IconButton, Input, useEditableControls, ButtonGroup, Editable, Tooltip, EditableInput, EditableTextarea, Container, CSSReset, Box, Text, Textarea, VStack, Grid, GridItem, Wrap, WrapItem, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Flex, Checkbox, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { FormErrorMessage, FormLabel, FormControl, Button } from '@chakra-ui/react'
import React, { useState, useRef } from 'react';
import { FaImage } from 'react-icons/fa';
import useApolloMutations from "../hooks/useApolloMutations";
import useStorage from "../hooks/useStorage";
import { useAccount, useSignMessage } from "wagmi"; 
import { useSigner } from 'wagmi';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";

// TODO: Upload recipe NFT

const CreateRecipe = ({ isOpen, onClose }) => {
  const [uploadIngredients, uploadSteps, uploadTasteProfile, uploadRecipe] = useApolloMutations();
  const [uploadRecipeNFT, uploadRecipeImage] = useStorage();
  const [uploading, setUploading] = useState(false);
  const [userID, setUserID] = useState('');
  const [imageCid, setimageCid] = useState('');
  const [mintNFT, setMintNFT] = useState(false);
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm()
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

  return (
    <>
    <CSSReset />
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Recipe</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormProvider {...{ handleSubmit, register, errors, isSubmitting }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl isInvalid={errors} as='fieldset' isDisabled={uploading}>
                <Accordion defaultIndex={[0, 1, 2, 3]} allowMultiple>
                  <AccordionItem>
                    <h2><AccordionButton>
                      <Box flex='1' textAlign='left'>
                        Recipe{errors && (errors.name || errors.description) ? <Text color='red'>*</Text> : null}
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
                    <h2><AccordionButton>
                      <Box flex='1' textAlign='left'>
                        Ingredients{errors && errors.ingredients ? <Text color='red'>*</Text> : null}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton></h2>
                    <AccordionPanel>
                      <FormLabel htmlFor="ingredients">
                        <GetIngredients />
                      </FormLabel>
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <h2><AccordionButton>
                      <Box flex='1' textAlign='left'>
                        Steps{errors && errors.steps ? <Text color='red'>*</Text> : null}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton></h2>
                      <AccordionPanel>
                        <FormLabel htmlFor="steps">
                          <GetSteps />
                        </FormLabel>
                      </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <h2><AccordionButton>
                      <Box flex='1' textAlign='left'>
                        Recipe Tags{errors && errors.tasteProfile ? <Text color='red'>*</Text> : null}
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

// Editable controls for recipe name and description
function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup justifyContent="end" size="sm" w="full" spacing={2} mt={2}>
        <IconButton border='1px'
          icon={<CheckIcon />} {...getSubmitButtonProps()} />
        <IconButton border='1px'
          icon={<CloseIcon boxSize={3} />}
          {...getCancelButtonProps()}
        />
      </ButtonGroup>
    ) : null;
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
    <Text align='center' fontSize={'large'}>Recipe Name<tspan>*</tspan></Text>
    <Container p={2} m={2} centerContent>
      <Editable
        placeholder="...click to add name, eg. Omellete"
        isPreviewFocusable={true}
        selectAllOnFocus={false}>
        <Tooltip label="Give your recipe a name.">
          <EditablePreview
            py={2}
            px={2}
            _hover={{
              background: useColorModeValue('gray.100', 'gray.700')
            }}
          />
        </Tooltip>
        <Input py={2} px={2} as={EditableInput} isInvalid={false}
        {...register('name', {required: 'Give your recipe a name'})} />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
        <EditableControls />
      </Editable>
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
    <Text align='center' fontSize={'large'}>Description<tspan>*</tspan></Text>
    <Container p={2} m={2} centerContent>
      <Editable
        placeholder="...click to add description, eg. Indian style omelette stuffed with cheese and tomatoes"
        isPreviewFocusable={true}
        selectAllOnFocus={false}>
        <Tooltip label="Add a short description of the dish.">
          <EditablePreview
            py={2}
            px={2}
            color={'brand.600'}
            _hover={{
              background: useColorModeValue('gray.100', 'gray.700')
            }}
          />
        </Tooltip>
        <Input py={2} px={2} as={EditableTextarea} isInvalid={false}
          {...register('description', {required: 'Add a short description of the dish'})} />
          <FormErrorMessage>
            {errors.description && errors.description.message}
          </FormErrorMessage>
        <EditableControls />
      </Editable>
    </Container>
    </Container>
  )
}

// Function to get the ingredients in the recipe
const GetIngredients = () => {
  const { register, errors } = useFormContext();
  const [numIngredients, setNumIngredients] = useState(1);

  // Function to get the name of the ingredient
  function GetName({ index }) {
    return (
      <>
      <Tooltip label="Name of the ingredient">
        <Input py={2} px={2} placeholder="...name, eg. eggs" isInvalid={false}
        {...register(`ingredients[${index}].name`, {required: 'Name of the ingredient'})} />
      </Tooltip>
      {errors.ingredients && errors.ingredients[index] && errors.ingredients[index].name && (
        <FormErrorMessage>
          {errors.ingredients[index].name && errors.ingredients[index].name.message}
        </FormErrorMessage>
      )}
      </>
    )
  }

  // Function to get the amount of ingredients
  function GetAmount({ index }) {
    return (
      <>
      <Tooltip label="Add the quantity of the ingredient">
        <Input py={2} px={2} placeholder="...amount, eg. 2, large" isInvalid={false}
        {...register(`ingredients[${index}].quantity`, {required: 'Add the quantity of the ingredient'})} />
      </Tooltip>
      {errors.ingredients && errors.ingredients[index] && errors.ingredients[index].quantity && (
        <FormErrorMessage>
          {errors.ingredients[index].quantity && errors.ingredients[index].quantity.message}
        </FormErrorMessage>
      )}
      </>
      )
  }

  // Function to get the ingredient's meta: the effect on the recipe's taste
  function GetIngredientComments({ index }) {
    return (
      <Tooltip label="Add any comments about the ingredient">
        <Textarea py={2} px={2} placeholder="...comments, eg. Organic free roam eggs" isInvalid={false}
        {...register(`ingredients[${index}].comments`)} />
      </Tooltip>
    )
  }

  // Function to get a picture of the ingredient
  function GetIngredientImage({ index }) {
    const { ref, onChange, ...fields } = register(`ingredients[${index}].image`)
    const [ingredientImageName, setIngredientImageName] = useState(null);
    const hiddenFileInput = useRef(null);
    const imageUpload = event => { hiddenFileInput.current?.click() }

    return (
      <>
      <IconButton icon={<FaImage />} onClick={imageUpload} mt={1} />
      <Flex>
        <Input type='file' style={{ display: 'none'}} accept='image/jpeg' {...fields} 
          onChange={event => { 
            onChange(event)
            setIngredientImageName(event.target.files[0].name) 
          }}
          ref={(instance) => {
            ref(instance)
            hiddenFileInput.current = instance
          }} />
        {ingredientImageName && <Text>{ingredientImageName}</Text>}
      </Flex>
      </>
    )
  }

  return (
    <Container p={2} m={2} centerContent>
    <Text align='center' fontSize={'large'}>Ingredients</Text>
    {Array.from({ length: numIngredients }, (_, index) => (
      <Box m={2} p={2}>
        <Flex>
          <Box>
            <Text>Name<tspan>*</tspan></Text>
            <GetName index={index} />
            <GetIngredientImage index={index} />
          </Box>
          <Box>
            <Text>Amount<tspan>*</tspan></Text>
            <GetAmount index={index} />
          </Box>
        </Flex>
        <Text>Comments</Text>
        <GetIngredientComments index={index} />
        </Box>
    ))}
    <ButtonGroup justifyContent="end" size="sm" w="full" spacing={2} mt={2}>
      <Button onClick={() => setNumIngredients(numIngredients + 1)}
        border='1px' >＋ Ingredient</Button>
      <IconButton icon={<CloseIcon boxSize={3} />} onClick={() => setNumIngredients(numIngredients - 1)} 
        border='1px' />
    </ButtonGroup>
    </Container>
  )
}

// Function to get the steps in the recipe
const GetSteps = () => {
  const { register, errors } = useFormContext();
  const [numSteps, setNumSteps] = useState(1);

  // Function to get the name of the step
  function GetStepName({ index }) {
    return (
      <>
      <Tooltip label="Step title">
        <Input py={2} px={2} placeholder="...title, eg. prepare egg mix" isInvalid={false}
        {...register(`steps[${index}].stepName`, {required: 'Add a step title'})} />
      </Tooltip>
      {errors.steps && errors.steps[index] && errors.steps[index].name && (
        <FormErrorMessage>
          {errors.steps[index].name && errors.steps[index].name.message}
        </FormErrorMessage>
      )}
      </>
    )
  }

  // Function to get the action of each step in the recipe
  function GetAction({ index }) {
    return (
      <>
      <Tooltip label="What're the actions for this step of the recipe?">
        <Textarea py={2} px={2} placeholder="...action, eg. crack eggs into a bowl, use a fork to mix with salt and pepper" isInvalid={false}
          {...register(`steps[${index}].action`, {required: 'What\'re the actions for this step of the recipe?', 
          maxLength: {value: 280, message: 'Action must be less than 280 characters'}})} />
      </Tooltip>
      {errors.steps && errors.steps[index] && errors.steps[index].action && (
      <FormErrorMessage>
        {errors.steps[index].action && errors.steps[index].action.message}
      </FormErrorMessage>)}
      </>
    )
  }

// Function to get the trigger for the next step in the recipe
  function GetTrigger({ index }) {
    return (
      <Tooltip label="What triggers the next step of the recipe?">
        <Input py={2} px={2} placeholder="...trigger, eg. stir until contents are mixed well" isInvalid={false}
          {...register(`steps[${index}].trigger`, 
          {maxLength: {value: 140, message: 'Trigger must be less than 140 characters'}})} />
      </Tooltip>
    )
  }

  // Function to get the meta of the step
  function GetStepComments({ index }) {
    return (
      <>
      <Tooltip label="How does the action(s) taken in this step affect the taste?">
        <Textarea py={2} px={2} placeholder="...comments, eg. replace pepper with red chilli powder to make it spicy" isInvalid={false}
          {...register(`steps[${index}].comments`, {
          maxLength: {value: 280, message: 'Meta must be less than 280 characters'}})} />
      </Tooltip>
      {errors.steps && errors.steps[index] && errors.steps[index].comments && (
      <FormErrorMessage>
        {errors.steps[index].comments && errors.steps[index].comments.message}
      </FormErrorMessage>)}
      </>
    )
  }

  // Function to get the image of the action
  function GetActionImage({ index }) {
    const { ref, onChange, ...fields } = register(`steps[${index}].actionImage`)
    const [actionImageName, setActionImageName] = useState(null);
    const hiddenFileInput = useRef(null);
    const imageUpload = event => { hiddenFileInput.current?.click() }
    return (
      <>
      <IconButton icon={<FaImage />} onClick={imageUpload} mt={1} />
      <Input type='file' style={{ display: 'none'}} accept='image/jpeg, video/*' {...fields} 
        onChange={event => { 
          onChange(event)
          setActionImageName(event.target.files[0].name) 
        }}
        ref={(instance) => {
          ref(instance)
          hiddenFileInput.current = instance
        }} />
      {actionImageName && <Text>{actionImageName}</Text>}
      </>
    )
  }

  // Function to get the image of the trigger
  function GetTriggerImage({ index }) {
    const { ref, onChange, ...fields } = register(`steps[${index}].triggerImage`)
    const [triggerImageName, setTriggerImageName] = useState(null);
    const hiddenFileInput = useRef(null);
    const imageUpload = event => { hiddenFileInput.current.click() }
    return (
      <>
      <IconButton icon={<FaImage />} onClick={imageUpload} mt={1} />
      <Input type='file' style={{ display: 'none'}} accept='image/jpeg, video/*' {...fields} 
        onChange={event => { 
          onChange(event)
          setTriggerImageName(event.target.files[0].name) 
        }}
        ref={(instance) => {
          ref(instance)
          hiddenFileInput.current = instance
        }} />
      {triggerImageName && <Text>{triggerImageName}</Text>}
      </>
    )
  }

return (
  <Container p={2} m={2} centerContent>
  <Text align='center' fontSize={'large'}>Steps</Text>
  <Wrap>
  {Array.from({ length: numSteps }, (_, index) => (
    <WrapItem key={index} borderRadius={2}>
      <VStack justifyContent="space-between" alignItems="center" mt={4} p={2}>
        <Text align='center'>Step {index + 1}<tspan>*</tspan></Text>
        <Box>
          <GetStepName index={index} />
        </Box>
        <Box>
          <Box>
            <Text mt={2}>Action<tspan>*</tspan></Text>
            <GetAction index={index} />
            <GetActionImage index={index} />
          </Box>
        </Box>
        <Box>
          <Box>
            <Text mt={2}>Trigger</Text>
            <GetTrigger index={index} />
            <GetTriggerImage index={index} />
          </Box>
        </Box>
        <Box>
          <Text mt={2}>Comments</Text>
          <GetStepComments index={index} />
        </Box>
      </VStack>
    </WrapItem>
  ))}
  </Wrap>
  <ButtonGroup justifyContent="end" size="sm" w="full" spacing={2} mt={2}>
    <Button onClick={() => setNumSteps(numSteps + 1)}
    border='1px'>＋ Step</Button>
    <IconButton icon={<CloseIcon boxSize={3} />} onClick={() => setNumSteps(numSteps - 1)}
    border='1px' />
  </ButtonGroup>
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
        <Input py={2} px={2} isInvalid={false} type='number' placeholder='Salt Rating'
          {...register('tasteProfile.salt', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.salt && errors.tasteProfile.salt.message && (
        <FormErrorMessage>
        {errors.tasteProfile.salt && errors.tasteProfile.salt.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSweetRating() {
    return (
      <>
      <Tooltip label="How sweet is this recipe? 0 = not sweet, 5 = very sweet">
        <Input py={2} px={2} isInvalid={false} type='number' placeholder='Sweet Rating'
          {...register('tasteProfile.sweet', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.sweet && errors.tasteProfile.sweet.message && (
        <FormErrorMessage>
        {errors.tasteProfile.sweet && errors.tasteProfile.sweet.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSourRating() {
    return (
      <>
      <Tooltip label="How sour is this recipe? 0 = not sour, 5 = very sour">
        <Input py={2} px={2} isInvalid={false} type='number' placeholder='Sour Rating'
          {...register('tasteProfile.sour', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.sour && errors.tasteProfile.sour.message && (
        <FormErrorMessage>
        {errors.tasteProfile.sour && errors.tasteProfile.sour.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetBitterRating() {
    return (
      <>
      <Tooltip label="How bitter is this recipe? 0 = not bitter, 5 = very bitter">
        <Input py={2} px={2} isInvalid={false} type='number' placeholder='Bitter Rating'
          {...register('tasteProfile.bitter', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.bitter && errors.tasteProfile.bitter.message && (
        <FormErrorMessage>
        {errors.tasteProfile.bitter && errors.tasteProfile.bitter.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSpiceRating() {
    return (
      <>
      <Tooltip label="How spicy is this recipe? 0 = not spicy, 5 = very spicy">
        <Input py={2} px={2} isInvalid={false} type='number' placeholder='Spice Rating'
          {...register('tasteProfile.spice', {required: 'Add a taste rating', min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.spice && errors.tasteProfile.spice.message && (
        <FormErrorMessage>
        {errors.tasteProfile.spice && errors.tasteProfile.spice.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetUmamiRating() {
    return (
      <>
      <Tooltip label="How umami is this recipe? 0 = not umami, 5 = very umami">
        <Input py={2} px={2} isInvalid={false} type='number' placeholder='Umami Rating'
          {...register('tasteProfile.umami', {min: 0, max: 5})} />
      </Tooltip>
      {errors.tasteProfile && errors.tasteProfile.umami && errors.tasteProfile.umami.message && (
        <FormErrorMessage>
        {errors.tasteProfile.umami && errors.tasteProfile.umami.message}
      </FormErrorMessage>)}
      </>
    )
  }
  return (
    <Container centerContent>
      <Text align='center' fontSize={'large'}>Taste Profile<tspan>*</tspan></Text>
      <Grid templateColumns={'repeat(auto-fit, minmax(200px, 1fr))'} gap={2}>
        <GridItem>
          <GetSaltRating />
        </GridItem>
        <GridItem>
          <GetSweetRating />
        </GridItem>
        <GridItem>
          <GetSourRating />
        </GridItem>
        <GridItem>
          <GetBitterRating />
        </GridItem>
        <GridItem>
          <GetSpiceRating />
        </GridItem>
        <GridItem>
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
      <Text align='center' fontSize={'large'}>Equipment</Text>
      <Tooltip label="List the equipment used, separated by commas.">
        <Input py={2} px={2} isInvalid={false} {...register('equipment')} />
      </Tooltip>
    </Container>
  )
}

// Function to get the quality tags of the recipe
function GetQualityTags() {
  const { register } = useFormContext();

  return (
    <Container p={2} m={2} centerContent>
      <Text align='center' fontSize={'large'}>Quality Tags</Text>
      <Tooltip label="What're the qualities of this recipe? How does this recipe taste? What other recipes does it work well with?">
        <Input py={2} px={2} isInvalid={false}
          {...register('qualityTags')} />
      </Tooltip>
    </Container>
  )
}

// Function to check whether the user wants to mint an NFT
function GetMintNFT({ setMintNFT }) {
  return (
    <Container p={2} m={2} centerContent>
      <Text mb={2} align='center' fontSize={'large'}>Mint NFT</Text>
      <Tooltip label="Do you want to mint an NFT of the recipe?">
        <Checkbox
          label="Mint NFT"
          isInvalid={false}
          onChange={(e) => setMintNFT(e.target.checked)}
        />
      </Tooltip>
    </Container>
  )
}

export default CreateRecipe;
import { EditablePreview, useColorModeValue, IconButton, Input, useEditableControls, ButtonGroup, Editable, Tooltip, EditableInput, EditableTextarea, Container, CSSReset, Box, Text, Textarea, VStack, Grid, GridItem, Wrap, WrapItem, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Flex, Checkbox } from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { FormErrorMessage, FormLabel, FormControl, Button } from '@chakra-ui/react'
import React, { useState, useRef } from 'react';
import { FaImage } from 'react-icons/fa';
import useApolloMutations from "./hooks/useApolloMutations";
import useNFTStorage from "./hooks/useNFTStorage";
import { useAccount, useSignMessage } from "wagmi"; 
import { useSigner } from 'wagmi';
import { verifyMessage } from 'ethers/lib/utils';
import { ConnectButton } from "@rainbow-me/rainbowkit";

const CreateRecipe = ({ isOpen, onClose }) => {
  const [uploadIngredients, uploadSteps, uploadTasteProfile, uploadRecipeImage, uploadRecipe] = useApolloMutations();
  const [uploadRecipeNFT] = useNFTStorage();
  const [uploading, setUploading] = useState(false);
  const [userID, setUserID] = useState('');
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm()
  const toast = useToast()
  const { isConnected, address: accountInfo } = useAccount();
  const { data: signer, isError: signerError, isLoading: signerLoading } = useSigner();
  const recoveredAddress = useRef('')
  const { data: signatureData, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      // Verify signature when sign message succeeds
      const address = verifyMessage(variables.message, data)
      recoveredAddress.current = address
    },
  })

  const onSubmit = async (data) => {
    console.log(data);
    try {
      let signature;
      let nftCid = '';
      let imageCid = '';
      const date = new Date().toISOString();
      setUploading(true)
      if (isConnected) {
        const sign = (message) => 
        new Promise((resolve, reject) => {
          signMessage({ message })
          resolve(signatureData)
          reject(new Error('Signature rejected'))
        })
        signature = await sign(`Create recipe ${data.name} on ${date}`)
        setUserID(accountInfo);
        console.log('userID', userID);
        console.log('signature', signature);
        if (data.recipeImage[0] && data.mintNFT && signer) {
          const image = data.recipeImage[0];
          const nftUploadData = { image, userID: userID, name: data.name, description: data.description, tasteProfile: data.tasteProfile, qualityTags: data.qualityTags, signer }
          nftCid = await uploadRecipeNFT(nftUploadData);
        }
        if (nftCid) console.log('nftCid', nftCid);
      } else if (!isConnected) {
        setUserID('0x0');
      }
      if (data.recipeImage[0]) {
        imageCid = await uploadRecipeImage(data.recipeImage[0]);
      } else if (!data.recipeImage[0]) {
        imageCid = '';
      }
      console.log(data.recipeImage[0], imageCid);
      async function addIngredients() {
        const names = [];
        const quantities = [];
        const comments = [];
        const imageCids = [];
        data.ingredients.forEach(async (ingredient, index) => {
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
        const ingredientList = { names, quantities, comments, imageCids, userID };
        const addedIngredients = await uploadIngredients(ingredientList);
        console.log(addedIngredients);
        const ingredientIDs = addedIngredients.ingredientIDs;
        return ingredientIDs;
      }
      async function addSteps() {
        const stepNames = [];
        const actions = [];
        const triggers = [];
        const actionImageCids = [];
        const triggerImageCids = [];
        const comments = [];
        data.steps.forEach(async (step, index) => {
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
        const stepList = { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID };
        const addedSteps = await uploadSteps(stepList);
        console.log(addedSteps);
        const stepIDs = addedSteps.stepIDs;
        return stepIDs;
      }
      async function addTasteProfile() {
        const tasteProfile = {
          salt: data.tasteProfile.salt,
          sweet: data.tasteProfile.sweet,
          sour: data.tasteProfile.sour,
          bitter: data.tasteProfile.bitter,
          spice: data.tasteProfile.spice,
          umami: data.tasteProfile.umami,
          userID: userID
        }
        const addedTasteProfile = await uploadTasteProfile(tasteProfile);
        console.log(addedTasteProfile);
        const tasteProfileID = addedTasteProfile.tasteProfileID;
        return tasteProfileID;
      }
      async function addRecipe(ingredientIDs, stepIDs, tasteProfileID) {
        const recipe = {
          name: data.name,
          imageCid: imageCid,
          description: data.description,
          ingredientIDs: ingredientIDs,
          stepIDs: stepIDs,
          tasteProfileID: tasteProfileID,
          qualityTags: data.qualityTags,
          equipment: data.equipment,
          userID: userID,
          signature: signature,
          createdAt: date
        }
        const uploadedRecipe = await uploadRecipe(recipe);
        console.log(uploadedRecipe);
        const recipeID = uploadedRecipe.recipeID;
        return recipeID;
      }
      const ingredientIDs = await addIngredients();
      if (ingredientIDs) {
        toast({
          title: 'Ingredients added',
          status: 'success',
          duration: 1000,
        })
      }
      const stepIDs = await addSteps();
      if (stepIDs) {
        toast({
          title: 'Steps added',
          status: 'success',
          duration: 1000,
        })
      }
      const tasteProfileID = await addTasteProfile();
      if (tasteProfileID) {
        toast({
          title: 'Taste profile added',
          status: 'success',
          duration: 1000,
        })
      }
      const recipeID = await addRecipe(ingredientIDs, stepIDs, tasteProfileID);
      setUploading(false);
      if (recipeID) {
        console.log('recipeID', recipeID);
        toast({
          title: 'Recipe uploaded successfully!',
          status: 'success',
          duration: 9000,
          isClosable: true,
        })
        onClose();
      } else {
        toast({
          title: 'Recipe upload failed, please try again.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.log('error: ', error)
    }
  }

  if (signerLoading) return <div>Loading</div>
  if (signerError) console.log(signerError);

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
                <Tabs>
                  <TabList>
                    <Tab>Recipe{errors && (errors.name || errors.description) ? <Text color='red'>*</Text> : null}</Tab>
                    <Tab>Ingredients{errors && errors.ingredients ? <Text color='red'>*</Text> : null}</Tab>
                    <Tab>Steps{errors && errors.steps ? <Text color='red'>*</Text> : null}</Tab>
                    <Tab>Meta Tags{errors && errors.tasteProfile ? <Text color='red'>*</Text> : null}</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <FormLabel htmlFor="name">
                        <GetRecipeName />
                      </FormLabel>
                      <FormLabel htmlFor="description">
                        <GetDescription />
                      </FormLabel>
                    </TabPanel>
                    <TabPanel>
                      <FormLabel htmlFor="ingredients">
                        <GetIngredients />
                      </FormLabel>
                    </TabPanel>
                    <TabPanel>
                      <FormLabel htmlFor="steps">
                        <GetSteps />
                      </FormLabel>
                    </TabPanel>
                    <TabPanel>
                      <FormLabel htmlFor="tasteProfile">
                        <GetTasteProfile />
                      </FormLabel>
                      <FormLabel htmlFor="equipment">
                        <GetEquipment />
                      </FormLabel>
                      <FormLabel htmlFor="qualityTags">
                        <GetQualityTags />
                      </FormLabel>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
                <FormLabel htmlFor="mintNFT">
                  <GetMintNFT />
                </FormLabel>
              </FormControl>
              {accountInfo ? <Button mt={4} isLoading={isSubmitting} type='submit' w='100%'>
                Create Recipe
              </Button> : <Button w='100%'><ConnectButton /></Button>}
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
    <Text as='u' align='center' fontSize={'large'}>Recipe Name</Text>
    <Container p={2} m={2} centerContent>
      <Editable
        placeholder="...name, eg. Omelette"
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
    <Text as='u' align='center' fontSize={'large'}>Description</Text>
    <Container p={2} m={2} centerContent>
      <Editable
        placeholder="...description, eg. Indian style omelette stuffed with cheese and tomatoes"
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
        <Input py={2} px={2} placeholder="...name, eg. eggs" variant={'flushed'} isInvalid={false}
        {...register(`ingredients[${index}].name`)} />
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
        <Input py={2} px={2} placeholder="...amount, eg. 2, large" variant={'flushed'} isInvalid={false}
        {...register(`ingredients[${index}].quantity`)} />
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
        <Textarea py={2} px={2} placeholder="...comments, eg. Organic free roam eggs" variant={'flushed'} isInvalid={false}
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
      <IconButton icon={<FaImage />} onClick={imageUpload} 
        border='1px' />
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
    <Text as='u' align='center' fontSize={'large'}>Ingredients</Text>
    {Array.from({ length: numIngredients }, (_, index) => (
      <Box border='1px' m={2} p={2}>
        <Flex>
          <Box>
            <Text>Name</Text>
            <GetName index={index} />
            <GetIngredientImage index={index} />
          </Box>
          <Box>
            <Text>Amount</Text>
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
        <Input py={2} px={2} placeholder="...title, eg. prepare egg mix" variant={'flushed'} isInvalid={false}
        {...register(`steps[${index}].stepName`)} />
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
        <Textarea py={2} px={2} placeholder="...action, eg. crack eggs into a bowl, use a fork to mix with salt and pepper" variant={'flushed'} isInvalid={false}
          {...register(`steps[${index}].action`, 
          {maxLength: {value: 280, message: 'Action must be less than 280 characters'}})} />
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
        <Textarea py={2} px={2} placeholder="...trigger, eg. stir until contents are mixed well" variant={'flushed'} isInvalid={false}
          {...register(`steps[${index}].trigger`, 
          {maxLength: {value: 280, message: 'Trigger must be less than 280 characters'}})} />
      </Tooltip>
    )
  }

  // Function to get the meta of the step
  function GetStepComments({ index }) {
    return (
      <>
      <Tooltip label="How does the action(s) taken in this step affect the taste?">
        <Textarea py={2} px={2} placeholder="...comments, eg. replace pepper with red chilli powder to make it spicy" variant={'flushed'} isInvalid={false}
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
      <IconButton icon={<FaImage />} onClick={imageUpload}
        border='1px' />
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
      <IconButton icon={<FaImage />} onClick={imageUpload}
        border='1px' />
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
  <Text as='u' align='center' fontSize={'large'}>Steps</Text>
  <Wrap>
  {Array.from({ length: numSteps }, (_, index) => (
    <WrapItem key={index} border='1px' borderRadius={2}>
      <VStack justifyContent="space-between" alignItems="center" mt={4} p={2}>
        <Text as='u' align='center'>Step {index + 1}</Text>
        <Box>
          <GetStepName index={index} />
        </Box>
        <Box>
          <Box>
            <Text mt={2} as='u'>Action</Text>
            <GetAction index={index} />
            <GetActionImage index={index} />
          </Box>
        </Box>
        <Box>
          <Box>
            <Text mt={2} as='u'>Trigger</Text>
            <GetTrigger index={index} />
            <GetTriggerImage index={index} />
          </Box>
        </Box>
        <Box>
          <Text mt={2} as='u'>Comments</Text>
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
        <Input py={2} px={2} placeholder="...salt rating, eg. 1" variant={'flushed'} isInvalid={false} type='number'
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
        <Input py={2} px={2} placeholder="...sweet rating, eg. 2" variant={'flushed'} isInvalid={false} type='number'
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
        <Input py={2} px={2} placeholder="...sour rating, eg. 3" variant={'flushed'} isInvalid={false} type='number'
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
        <Input py={2} px={2} placeholder="...bitter rating, eg. 4" variant={'flushed'} isInvalid={false} type='number'
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
        <Input py={2} px={2} placeholder="...spice rating, eg. 5" variant={'flushed'} isInvalid={false} type='number'
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
        <Input py={2} px={2} placeholder="...umami rating, eg. 0" variant={'flushed'} isInvalid={false} type='number'
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
    <Text align='center' as='u' fontSize={'large'}>Taste Profile</Text>
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
      <Text as='u' align='center' fontSize={'large'}>Equipment</Text>
      <Editable
        placeholder="...equipment, eg. fork, spatula, pan"
        isPreviewFocusable={true}
        selectAllOnFocus={false}>
        <Tooltip label="List the equipment used, separated by commas.">
          <EditablePreview
            py={2}
            px={2}
            _hover={{
              background: useColorModeValue('gray.100', 'gray.700')
            }}
            />
        </Tooltip>
        <Input py={2} px={2} as={EditableTextarea} isInvalid={false} {...register('equipment')} />
      </Editable>
    </Container>
  )
}

// Function to get the quality tags of the recipe
function GetQualityTags() {
  const { register } = useFormContext();

  // Function to get the tag of the quality
  function GetTags() {
    return (
      <Tooltip label="What're the qualities of this recipe? How does this recipe taste? What other recipes does it work well with?">
        <Textarea py={2} px={2} placeholder="...tags, eg. high protien, breakfast food" variant={'flushed'} isInvalid={false}
          {...register('qualityTags')} />
      </Tooltip>
    )
  }
  
  return (
    <Container p={2} m={2} centerContent>
      <VStack spacing={2}>
        <Text as='u' align='center' fontSize={'large'}>Quality Tags</Text>
        <GetTags />
      </VStack>
    </Container>
  )
}

// Function to check whether the user wants to mint an NFT
function GetMintNFT() {
  const { register } = useFormContext();
  return (
    <Container p={2} m={2} centerContent>
      <Text as='u' mb={2} align='center' fontSize={'large'}>Mint NFT</Text>
      <Tooltip label="Do you want to mint an NFT of the recipe?">
        <Checkbox
          label="Mint NFT"
          isInvalid={false}
          {...register('mintNFT')}
        />
      </Tooltip>
    </Container>
  )
}

export default CreateRecipe;
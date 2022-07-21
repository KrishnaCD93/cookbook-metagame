import { EditablePreview, useColorModeValue, IconButton, Input, useEditableControls, ButtonGroup, Editable, Tooltip, EditableInput, EditableTextarea, Container, CSSReset, Box, Text, Textarea, VStack, Grid, GridItem, Wrap, WrapItem, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { FormErrorMessage, FormLabel, FormControl, Button } from '@chakra-ui/react'
import React, { useState, useRef } from 'react';
import { FaImage } from 'react-icons/fa';
import useFleekStorage from "./hooks/useFleekStorage";
import useApolloMutations from "./hooks/useApolloMutations";

// Create recipe page with recipe name, description, ingredients, steps, metaquality tags, and recipe image
const CreateRecipe = ({ isOpen, onClose, signMessageWithEthereum, accountInfo }) => {
  const [fleekStorageUploadRecipeImage] = useFleekStorage();
  const [uploadIngredients, uploadSteps, uploadTasteProfile, uploadRecipe] = useApolloMutations();
  const [uploading, setUploading] = useState(false);
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm()
  const toast = useToast()

  const onSubmit = async (data) => {
    console.log(data);
    try {
      let userID = '';
      let signature = '';
      setUploading(true)
      if (accountInfo) {
        userID = accountInfo;
        signature = await signMessageWithEthereum();
      }
      let imageCid;
      if (data.recipeImage[0]) {
        const imageInfo = {};
        imageInfo.name = data.name + '-Image';
        imageInfo.type = 'recipeImage';
        imageInfo.recipe = data.name;
        const imageUpload = await fleekStorageUploadRecipeImage(imageInfo, data.recipeImage[0], accountInfo);
        imageCid = imageUpload.hash;
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
            const imageInfo = {};
            imageInfo.name = ingredient.name;
            imageInfo.type = 'ingredient';
            imageInfo.recipe = data.name;
            const imageUpload = await fleekStorageUploadRecipeImage(imageInfo, ingredient.image[0], accountInfo);
            imageCids[index] = imageUpload.hash
          } else if (!ingredient.image[0]) {
            imageCids[index] = ''
          }
        })
        const ingredientList = { names, quantities, comments, imageCids, userID };
        const addedIngredients = await uploadIngredients(ingredientList);
        console.log(addedIngredients);
        const ingredientIds = addedIngredients.ingredientIDs;
        return ingredientIds;
      }
      async function addSteps() {
        const stepNames = [];
        const actions = [];
        const triggers = [];
        const actionImageCids = [];
        const triggerImageCids = [];
        const comments = [];
        const stepActionImageData = {};
        const stepTriggerImageData = {};
        data.steps.forEach(async (step, index) => {
          if (!step.action) return;
          stepNames[index] = step.stepName;
          actions[index] = step.action;
          triggers[index] = step.trigger;
          comments[index] = step.comments;
          if (step.actionImage[0]) {
            stepActionImageData.type = `step-${index+1}-actionImage`;
            stepActionImageData.name = 'actionImage';
            stepActionImageData.recipe = data.name;
            const imageUpload = await fleekStorageUploadRecipeImage(stepActionImageData, step.actionImage[0], accountInfo);
            actionImageCids[index] = imageUpload.hash
          } else if (!step.actionImage[0]) {
            actionImageCids[index] = ''
          }
          if (step.triggerImage[0]) {
            stepTriggerImageData.type = `step-${index+1}-triggerImage`;
            stepTriggerImageData.name = 'triggerImage';
            stepTriggerImageData.recipe = data.name;
            const imageUpload = await fleekStorageUploadRecipeImage(stepTriggerImageData, step.triggerImage[0], accountInfo);
            triggerImageCids[index] = imageUpload.hash
          } else if (!step.triggerImage[0]) {
            triggerImageCids[index] = ''
          }
        })
        const stepList = { stepNames, actions, triggers, actionImageCids, triggerImageCids, comments, userID };
        const addedSteps = await uploadSteps(stepList);
        console.log(addedSteps);
        const stepIds = addedSteps.stepIDs;
        return stepIds;
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
        const tasteProfileId = addedTasteProfile.tasteProfileID;
        return tasteProfileId;
      }
      async function addRecipe(ingredientIds, stepIds, tasteProfileId) {
        const recipe = {
          name: data.name,
          imageCid: imageCid,
          description: data.description,
          ingredientIDs: ingredientIds,
          stepIDs: stepIds,
          tasteProfileID: tasteProfileId,
          metaQualityTags: data.metaQualityTags,
          equipment: data.equipment,
          userID: userID,
          signature: signature,
          createdAt: new Date().toISOString()
        }
        const uploadedRecipe = await uploadRecipe(recipe);
        console.log(uploadedRecipe);
        const recipeId = uploadedRecipe.recipeID;
        return recipeId;
      }
      const ingredientIds = await addIngredients();
      const stepIds = await addSteps();
      const tasteProfileId = await addTasteProfile();
      const recipeId = await addRecipe(ingredientIds, stepIds, tasteProfileId);
      console.log(recipeId);
      setUploading(false);
      if (recipeId) {
        toast({
          title: 'Recipe uploaded successfully',
          status: 'success',
          duration: 9000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Recipe upload failed',
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.log('error: ', error)
    }
  }

  return (
    <>
    <CSSReset />
    <Modal isOpen={isOpen} onClose={onClose}>
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
                    <Tab>Recipe{errors && errors.name ? <Text color='red'>*</Text> : null}</Tab>
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
                      <FormLabel htmlFor="metaQualityTags">
                        <GetMetaQualityTags />
                      </FormLabel>
                      </FormLabel>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </FormControl>
              <Button mt={4} isLoading={isSubmitting} type='submit' w='100%'>
                Create
              </Button>
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
  const { ref, ...fields } = register('recipeImage')
  const hiddenFileInput = useRef(null);
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
    <Input type={'file'} style={{ display: 'none' }} accept='image/*, video/*' {...fields}
      ref={(instance) => {
        ref(instance)
        hiddenFileInput.current = instance
      }} />
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
          {...register('description')} />
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
        {...register(`ingredients[${index}].name`, {required: 'Give the ingredient a name'})} />
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
        {...register(`ingredients[${index}].quantity`, {required: 'Give the ingredient a quantity'})} />
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
      <Tooltip label="How does this ingredient affect the taste of the recipe?">
        <Textarea py={2} px={2} placeholder="...comments, eg. Organic free roam eggs" variant={'flushed'} isInvalid={false}
        {...register(`ingredients[${index}].comments`)} />
      </Tooltip>
    )
  }

  // Function to get a picture of the ingredient
  function GetImage({ index }) {
    const { ref, ...fields } = register(`ingredients[${index}].image`)
    const hiddenFileInput = useRef(null);
    const imageUpload = event => { hiddenFileInput.current?.click() }
    return (
      <>
      <IconButton icon={<FaImage />} onClick={imageUpload} 
        border='1px' />
      <Input py={2} px={2} style={{ display: 'none'}} accept='image/*, video/*' {...fields}
        type='file' ref={(instance) => {
          ref(instance)
          hiddenFileInput.current = instance
        }} />
      </>
    )
  }

  return (
    <Container p={2} m={2} centerContent>
    <Text as='u' align='center' fontSize={'large'}>Ingredients</Text>
    <Wrap>
      {Array.from({ length: numIngredients }, (_, index) => (
      <WrapItem key={index} border='1px' borderRadius={2}>
        <VStack justifyContent="space-between" alignItems="center" mt={4} p={2}>
          <Box>
            <GetName index={index} />
            <GetAmount index={index} />
            <GetIngredientComments index={index} />
            <GetImage index={index} />
          </Box>
        </VStack>
      </WrapItem>
      ))}
    </Wrap>
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
          {...register(`steps[${index}].action`, {required: 'Add an action',
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
    const { ref, ...fields } = register(`steps[${index}].actionImage`)
    const hiddenFileInput = useRef(null);
    const imageUpload = event => { hiddenFileInput.current?.click() }
    return (
      <>
      <IconButton icon={<FaImage />} onClick={imageUpload}
        border='1px' />
      <Input type='file' style={{ display: 'none'}} accept='image/*, video/*' {...fields} 
        ref={(instance) => {
          ref(instance)
          hiddenFileInput.current = instance
        }} />
      </>
    )
  }

  // Function to get the image of the trigger
  function GetTriggerImage({ index }) {
    const { ref, ...fields } = register(`steps[${index}].triggerImage`)
    const hiddenFileInput = useRef(null);
    const imageUpload = event => { hiddenFileInput.current.click() }
    return (
      <>
      <IconButton icon={<FaImage />} onClick={imageUpload}
        border='1px' />
      <Input type='file' style={{ display: 'none'}} accept='image/*, video/*' {...fields} 
        ref={(instance) => {
          ref(instance)
          hiddenFileInput.current = instance
        }} />
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
        <Text as='u' align='center' fontSize={'large'}>Step {index + 1}</Text>
        <Box border='1px' borderRadius={2}>
          <GetStepName index={index} />
        </Box>
        <Box border='1px' borderRadius={2}>
          <Box>
            <GetAction index={index} />
            <GetActionImage index={index} />
          </Box>
        </Box>
        <Box border='1px' borderRadius={2}>
          <Box>
            <GetTrigger index={index} />
            <GetTriggerImage index={index} />
          </Box>
        </Box>
        <Box>
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

// Function to get the metaquality tags of the recipe
function GetMetaQualityTags() {
  const { register } = useFormContext();

  // Function to get the tag of the metaquality
  function GetTags() {
    return (
      <Tooltip label="What're the qualities of this recipe? How does this recipe taste? What other recipes does it work well with?">
        <Textarea py={2} px={2} placeholder="...tags, eg. high protien, breakfast food" variant={'flushed'} isInvalid={false}
          {...register('metaQualityTags')} />
      </Tooltip>
    )
  }
  
  return (
    <Container p={2} m={2} centerContent>
      <VStack spacing={2}>
        <Text as='u' align='center' fontSize={'large'}>Metaquality Tags</Text>
        <GetTags />
      </VStack>
    </Container>
  )
}

export default CreateRecipe;
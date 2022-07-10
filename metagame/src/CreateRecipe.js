import { EditablePreview, useColorModeValue, IconButton, Input, useEditableControls, ButtonGroup, Editable, Tooltip, EditableInput, EditableTextarea, Container, CSSReset, Box, Text, Textarea, VStack, Wrap, WrapItem, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { FormErrorMessage, FormLabel, FormControl, Button } from '@chakra-ui/react'
import React, { useState, useRef } from 'react';
import { FaImage } from 'react-icons/fa';

import { useSignMessage } from 'wagmi'
import { verifyMessage } from 'ethers/lib/utils'

// Create recipe page with recipe name, description, ingredients, steps, metaquality tags, and recipe image
const CreateRecipe = ({ isOpen, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm()
  const toast = useToast()

  const onSubmit = async (data) => {
    try {
      setUploading(true)
      console.log(data)
      const formData = new FormData(data);
      setUploading(false);
      toast({
        title: 'Recipe uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.log('error: ', error)
    }
  }

  if (isSubmitting) {
    console.log('Submitting...')
  }

  if (errors) {
    console.log('errors: ', errors)
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
                    <Tab>Recipe {errors && errors.name ? <Text color='red'>*</Text> : null}</Tab>
                    <Tab>Ingredients {errors && errors.ingredients ? <Text color='red'>*</Text> : null}</Tab>
                    <Tab>Steps {errors && errors.steps ? <Text color='red'>*</Text> : null}</Tab>
                    <Tab>Meta Quality Tags</Tab>
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
                      <FormLabel htmlFor="metaQualityTags">
                        <GetMetaQualityTags />
                      </FormLabel>
                      <FormLabel htmlFor="tasteProfile">
                        <GetTasteProfile />
                      </FormLabel>
                      <FormLabel htmlFor="equipment">
                        <GetEquipment />
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
        <Textarea py={2} px={2} placeholder="...comments, eg. I use organic free roam eggs" variant={'flushed'} isInvalid={false}
        {...register(`ingredients[${index}].ingredientComments`)} />
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
          {...register(`steps[${index}].stepComments`, {
          maxLength: {value: 280, message: 'Meta must be less than 280 characters'}})} />
      </Tooltip>
      {errors.steps && errors.steps[index] && errors.steps[index].stepComments && (
      <FormErrorMessage>
        {errors.steps[index].stepComments && errors.steps[index].stepComments.message}
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
        <Text fontSize={'large'}>Step {index + 1}</Text>
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

// Function to get the taste profile for the recipe
function GetTasteProfile() {
  const { register, errors } = useFormContext();

  function GetSaltRating() {
    return (
      <>
      <Tooltip label="How salty is this recipe? 0 = not salty, 5 = very salty">
        <Input py={2} px={2} placeholder="...salt rating, eg. 1" variant={'flushed'} isInvalid={false} type='number'
          {...register('saltRating', {min: 0, max: 5})} />
      </Tooltip>
      {errors.saltRating && errors.saltRating.message && (
      <FormErrorMessage>
        {errors.saltRating && errors.saltRating.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSweetRating() {
    return (
      <>
      <Tooltip label="How sweet is this recipe? 0 = not sweet, 5 = very sweet">
        <Input py={2} px={2} placeholder="...sweet rating, eg. 2" variant={'flushed'} isInvalid={false} type='number'
          {...register('sweetRating', {min: 0, max: 5})} />
      </Tooltip>
      {errors.sweetRating && errors.sweetRating.message && (
      <FormErrorMessage>
        {errors.sweetRating && errors.sweetRating.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSourRating() {
    return (
      <>
      <Tooltip label="How sour is this recipe? 0 = not sour, 5 = very sour">
        <Input py={2} px={2} placeholder="...sour rating, eg. 3" variant={'flushed'} isInvalid={false} type='number'
          {...register('sourRating', {min: 0, max: 5})} />
      </Tooltip>
      {errors.sourRating && errors.sourRating.message && (
      <FormErrorMessage>
        {errors.sourRating && errors.sourRating.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetBitterRating() {
    return (
      <>
      <Tooltip label="How bitter is this recipe? 0 = not bitter, 5 = very bitter">
        <Input py={2} px={2} placeholder="...bitter rating, eg. 4" variant={'flushed'} isInvalid={false} type='number'
          {...register('bitterRating', {min: 0, max: 5})} />
      </Tooltip>
      {errors.bitterRating && errors.bitterRating.message && (
      <FormErrorMessage>
        {errors.bitterRating && errors.bitterRating.message}
      </FormErrorMessage>)}
      </>
    )
  }
  function GetSpicyRating() {
    return (
      <>
      <Tooltip label="How spicy is this recipe? 0 = not spicy, 5 = very spicy">
        <Input py={2} px={2} placeholder="...spicy rating, eg. 5" variant={'flushed'} isInvalid={false} type='number'
          {...register('spicyRating', {min: 0, max: 5})} />
      </Tooltip>
      {errors.spicyRating && errors.spicyRating.message && (
      <FormErrorMessage>
        {errors.spicyRating && errors.spicyRating.message}
      </FormErrorMessage>)}
      </>
    )
  }
  return (
    <Container centerContent>
    <Text align='center' as='u' fontSize={'large'}>Taste Profile</Text>
    <Wrap>
      <WrapItem>
        <GetSaltRating />
      </WrapItem>
      <WrapItem>
        <GetSweetRating />
      </WrapItem>
      <WrapItem>
        <GetSourRating />
      </WrapItem>
      <WrapItem>
        <GetBitterRating />
      </WrapItem>
      <WrapItem>
        <GetSpicyRating />
      </WrapItem>
    </Wrap>
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

export default CreateRecipe;
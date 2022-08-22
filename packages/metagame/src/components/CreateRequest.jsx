import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { Button, ButtonGroup, Container, CSSReset, Editable, EditableInput, EditablePreview, EditableTextarea, Flex, FormControl, FormErrorMessage, FormLabel, Grid, GridItem, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Tooltip, useColorModeValue, useEditableControls, useToast } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { FaImage } from 'react-icons/fa';
import { useAccount, useSignMessage } from 'wagmi';
import useApolloMutations from '../hooks/useApolloMutations';
import useStorage from '../hooks/useStorage';

const CreateRequest = ({ isOpen, onClose }) => {
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm()
  const [uploading, setUploading] = useState(false)
  const [userID, setUserID] = useState('')
  const { signMessageAsync } = useSignMessage()
  const [, , uploadTasteProfile, , , , , uploadRecipeRequest] = useApolloMutations()
  const { address, isConnected } = useAccount()
  const toast = useToast()
  const [imageCid, setimageCid] = useState('');
  const [, uploadRecipeImage] = useStorage();

  useEffect(() => {
    if (address) {
      setUserID(address)
    } else {
      setUserID('0x0')
    }
  }, [address])

  const onSubmit = async (data) => {
    setUploading(true)
    console.log(data)
    if (!isConnected) {
      toast({
        title: "Not connected to wallet",
        description: "Please connect your Ethereum address to authenticate your request.",
        status: "error",
        duration: 9000,
        isClosable: true,
      })
      return
    }
    const date = new Date().toISOString()
    const signatureMessage = `Create request for ${data.name} on ${date} by ${address}`
    console.log(signatureMessage)
    const signData = await signMessageAsync({ message: signatureMessage })
    console.log(signData)
    localStorage.setItem('signature', signData)
    if (data.recipeImage[0]) {
      const imageData = await uploadRecipeImage(data.recipeImage[0]);
      setimageCid(imageData);
    }
    const tasteProfileData = { 
      salt: data.tasteProfile.salt,
      sweet: data.tasteProfile.sweet,
      sour: data.tasteProfile.sour,
      bitter: data.tasteProfile.bitter,
      spice: data.tasteProfile.spice,
      umami: data.tasteProfile.umami,
      userID: userID,
      signatureMessage: signatureMessage,
    }
    const uploadedTasteProfile = await uploadTasteProfile(tasteProfileData);
    if (uploadedTasteProfile.success) {
      toast({
        title: 'taste profile uploaded',
        description: 'Your recipe has been created',
        status: 'success',
        duration: 1000,
      })
    } else {
      toast({
        title: 'taste profile upload failed',
        description: 'Please try again',
        status: 'error',
        duration: 1000,
      })
    }
    const recipeRequest = await uploadRecipeRequest({ 
      name: data.name, 
      description: data.description, 
      imageCid: imageCid,
      tasteProfileID: uploadedTasteProfile.tasteProfileID, 
      nutritionalRequirements: data.nutrition, 
      dietaryRequirements: data.dietary, 
      qualityTags: data.qualityTags, 
      equipment: data.equipment, 
      userID: userID, 
      createdAt: date,
      signatureMessage: signatureMessage,
    })
    if (recipeRequest.success) {
      toast({
        title: 'Request created',
        description: 'Your request has been created and will be reviewed by the community',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setUploading(false)
      onClose()
    } else {
      toast({
        title: 'Error',
        description: 'There was an error creating your request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setUploading(false)
  }

  return ( 
  <>
  <CSSReset />
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Create Request</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormProvider {...{ handleSubmit, register, errors, isSubmitting }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={errors} as='fieldset' isDisabled={uploading}>
            <Tabs>
              <TabList>
                <Tab>Recipe{errors && (errors.name || errors.description) ? <Text color='red'>*</Text> : null}</Tab>
                <Tab>Taste Profile{errors && errors.tasteProfile ? <Text color='red'>*</Text> : null}</Tab>
                <Tab>Nutrition{errors && errors.nutrition ? <Text color='red'>*</Text> : null}</Tab>
                <Tab>Recipe Tags</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormLabel htmlFor='recipeName'>
                    <GetRecipeName />
                  </FormLabel>
                  <FormLabel htmlFor='description'>
                    <GetDescription />
                  </FormLabel>
                </TabPanel>
                <TabPanel>
                  <FormLabel htmlFor='tasteProfile'>
                    <GetTasteProfile />
                  </FormLabel>
                </TabPanel>
                <TabPanel>
                  <FormLabel htmlFor='nutrition'>
                    <GetDietNutrition />
                  </FormLabel>
                </TabPanel>
                <TabPanel>
                  <FormLabel htmlFor='qualityTags'>
                    <GetQualityTags />
                  </FormLabel>
                  <FormLabel htmlFor='equipment'>
                    <GetEquipment />
                  </FormLabel>
                </TabPanel>
              </TabPanels>
            </Tabs>
            </FormControl>
            <Button type='submit' w='100%' isLoading={uploading}>Create Request</Button>
          </form>
        </FormProvider>
      </ModalBody>
    </ModalContent>
  </Modal>
  </> 
  );
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
        placeholder="...Omelette"
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
        placeholder="...Indian style omelette stuffed with cheese and tomatoes"
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

// Function to get the dietary and nutritional requirements for the recipe
function GetDietNutrition() {
  const { register, errors } = useFormContext();
  
  function GetDietary() {
    return (
      <Container centerContent>
        <Text align='center' as='u' fontSize={'large'}>Dietary Requirements</Text>
        <Tooltip label="What dietary requirements do you have for this recipe?">
          <Input py={2} px={2} isInvalid={false}
            {...register('dietary', {required: 'Add a dietary requirement'})} />
        </Tooltip>
        {errors.dietary && errors.dietary.message && (
          <FormErrorMessage>
          {errors.dietary && errors.dietary.message}
        </FormErrorMessage>)}
      </Container>
    )
  }
  function GetNutrition() {
    return (
      <Container centerContent>
        <Text align='center' as='u' fontSize={'large'}>Nutritional Requirements</Text>
        <Tooltip label="What nutritional requirements do you have for this recipe?">
          <Input py={2} px={2} isInvalid={false}
            {...register('nutrition', {required: 'Add a nutritional requirement'})} />
        </Tooltip>
        {errors.nutrition && errors.nutrition.message && (
          <FormErrorMessage>
          {errors.nutrition && errors.nutrition.message}
        </FormErrorMessage>)}
      </Container>
    )
  }
  return (
    <Container centerContent>
      <Grid templateColumns={'repeat(auto-fit, minmax(200px, 1fr))'} gap={2}>
        <GridItem>
          <GetDietary />
        </GridItem>
        <GridItem>
          <GetNutrition />
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
      <Text as='u' align='center' fontSize={'large'}>Quality Tags</Text>
      <Tooltip label="What're the qualities of this recipe? How does this recipe taste? What other recipes does it work well with?">
        <Input py={2} px={2} isInvalid={false}
          {...register('qualityTags')} />
      </Tooltip>
    </Container>
  )
}

export default CreateRequest;
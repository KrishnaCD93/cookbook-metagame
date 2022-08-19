import React, { useRef } from 'react'
import useApolloMutations from '../hooks/useApolloMutations'
import useStorage from '../hooks/useStorage'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { Button, Container, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, FormControl, FormErrorMessage, FormLabel, IconButton, Input, Text, Tooltip, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useEffect } from 'react'
import { FaImage } from 'react-icons/fa'

const CreateUser = ({ isOpen, onClose, btnRef }) => {
  const [, , , , , , , , uploadUser] = useApolloMutations()
  const [, , uploadUserImage] = useStorage()
  const [uploading, setUploading] = useState(false)
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm()
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [userID, setUserID] = useState('')
  const toast = useToast()

  useEffect(() => {
    setUserID(address)
  }, [address])

  const onSubmit = async (data) => {
    setUploading(true)
    let imageCid;
    if (data.image[0]) {
      imageCid = await uploadUserImage(data.image[0])
    }
    const signatureMessage = `I am signing my one-time message to authenticate my cookbook account. ${userID}`
    const signature = await signMessageAsync({message: signatureMessage})
    localStorage.setItem('signature', signature)
    const userInfo = {
      userID: userID,
      signatureMessage: signatureMessage,
      name: data.name,
      imageCid: imageCid,
      email: data.email
    }
    const uploadedUser = uploadUser(userInfo);
    if (uploadedUser.success) {
      toast({
        title: "User created.",
        status: "success",
        duration: 9000,
      })
    }
  }

  return ( 
    <>
    <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create your account</DrawerHeader>
            <FormProvider {...{ handleSubmit, register, errors, isSubmitting }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DrawerBody>
                <FormControl isInvalid={errors} as='fieldset' isDisabled={uploading}>
                  <FormLabel htmlFor='name'>
                    <GetUserName />
                  </FormLabel>
                  <FormLabel htmlFor='email'>
                    <GetUserEmail />
                  </FormLabel>
                </FormControl>
                </DrawerBody>
                <DrawerFooter>
                  <Button variant='outline' mr={3} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type='submit' colorScheme='blue'>Save</Button>
                </DrawerFooter>
              </form>
            </FormProvider>
        </DrawerContent>
      </Drawer>
    </>
  );
}

// Function to get username
function GetUserName() {
  const { register, errors } = useFormContext();
  const { ref, onChange, ...fields } = register('image')
  const hiddenFileInput = useRef(null);
  const [imageName, setImageName] = useState(null);
  const imageUpload = event => { 
    hiddenFileInput.current?.click();
  }

  return (
    <Container p={2} m={2} centerContent>
    <Text as='u' align='center' fontSize={'large'}>Name</Text>
    <Container p={2} m={2} centerContent>
      <Tooltip label="Add your name.">
        <Input py={2} px={2} isInvalid={false}
        {...register('name', {required: 'Add your name'})} />
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

// Function to get the recipe email
function GetUserEmail() {
  const { register, errors } = useFormContext();
  return (
    <Container p={2} m={2} centerContent>
      <Text as='u' align='center' fontSize={'large'}>Email</Text>
      <Container p={2} m={2} centerContent>
        <Tooltip label="Add your email address.">
          <Input py={2} px={2} isInvalid={false}
            {...register('email', {required: 'Add your email address',  pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Entered value does not match email format"
            }})} type='email' />
        </Tooltip>
        <FormErrorMessage>
          {errors.email && errors.email.message}
        </FormErrorMessage>
      </Container>
    </Container>
  )
}


export default CreateUser;
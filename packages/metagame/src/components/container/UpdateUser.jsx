import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay } from '@chakra-ui/react'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

const UpdateUser = ({ isOpen, onClose, btnRef }) => {
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = (data) => {
    console.log(data)
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
          <DrawerHeader>Update your account</DrawerHeader>
            <FormProvider {...{ handleSubmit, register, errors, isSubmitting }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DrawerBody>
                  
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

export default UpdateUser;
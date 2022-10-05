import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay } from '@chakra-ui/react'
import { useSignOut } from '@nhost/react'
import React from 'react'


const UpdateUser = ({ isOpen, onClose, btnRef, authType }) => {
  const { signOut } = useSignOut()
  const onSubmit = (data) => {
    console.log(data)
  }

  if (authType === 'ethereum') {
    console.log('ethereum')
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
                <form onSubmit={onSubmit}>
                  <DrawerBody>
                    
                  </DrawerBody>

                  <DrawerFooter>
                    <Button variant='outline' mr={3} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type='submit' colorScheme='blue'>Save</Button>
                  </DrawerFooter>
                </form>
          </DrawerContent>
        </Drawer>
      </>
    );
  } else if (authType === 'nhost') {
    console.log('nhost')
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
            <DrawerBody>
              <Button onClick={() => signOut()}>Sign out</Button>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    )
  }
}

export default UpdateUser;
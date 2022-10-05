import React, { useEffect, useRef, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useAccount } from 'wagmi'
import { cld } from '../../App';
import { AdvancedImage } from '@cloudinary/react';
import { scale } from "@cloudinary/url-gen/actions/resize";
import CreateUser from './CreateUser'
import { useDisclosure } from '@chakra-ui/hooks';
import { Box, Icon, IconButton, Image, Spinner } from '@chakra-ui/react';
import { FaUserCircle, FaUserPlus } from 'react-icons/fa';
import UpdateUser from './UpdateUser';
import { useAuthenticationStatus, useUserData } from '@nhost/react';

const GET_USER = gql`
  query UserData($userID: String!) {
    user(userID: $userID) {
      userID
      name
      imageCid
      email
    }
  }
`;

const User = () => {
  const { isOpen: createIsOpen, onOpen: createOnOpen, onClose: createOnClose } = useDisclosure()
  const { isOpen: updateIsOpen, onOpen: updateOnOpen, onClose: updateOnClose } = useDisclosure()
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const userData = useUserData()
  const createBtnRef = useRef()
  const updateBtnRef = useRef()
  const { address } = useAccount()
  const [user, setUser] = useState('0x0')
  const [image, setImage] = useState(null)
  const [authType, setAuthType] = useState('')
  const [getUserData, { loading, error, data }] = useLazyQuery(GET_USER, { variables: { userID: `${user}` } });
  useEffect(() => {
    if (address) {
      const getUser = async () => {
        await getUserData()
      }
      setUser(address)
      getUser()
      setAuthType('ethereum')
    }
  }, [address, user, getUserData])
  useEffect(() => {
    if (isAuthenticated && !address) {
      setUser(userData?.displayName)
      setAuthType('nhost')
    }
  }, [address, isAuthenticated, userData])
  useEffect(() => {
    if (data && data.user && data.user.imageCid) {
      try {
        const img = cld.image(data.user.imageCid)
        img.resize(scale().width(50).height(50));
        setImage(img)
      } catch(e) {
        console.log(e)
      }
    }
  }, [data])

  if (loading || isLoading) return <Spinner />

  if (error) console.log('user error', error)

  if (data && data.user) {
    return ( 
      <>
        <Box borderRadius={50} overflow="hidden" onClick={updateOnOpen} ref={updateBtnRef}
        _hover={{ cursor: 'pointer', bg: 'grey.300' }}>
          {data.user.imageCid ? <AdvancedImage cldImg={image} /> : <Icon as={FaUserCircle} mt={2} />} 
        </Box>
        <UpdateUser isOpen={updateIsOpen} onClose={updateOnClose} btnRef={updateBtnRef} authType={authType} />
      </> 
    );
  } else if (isAuthenticated) {
    return (
      <>
        <Box borderRadius={50} overflow="hidden" onClick={updateOnOpen} ref={updateBtnRef}
        _hover={{ cursor: 'pointer', bg: 'grey.300' }}>
          <Image src={userData.avatarUrl} alt={FaUserCircle} boxSize='50px' />
        </Box>
        <UpdateUser isOpen={updateIsOpen} onClose={updateOnClose} btnRef={updateBtnRef} authType={authType} />
      </>
    )
  } else {
    return (
      <>
        <IconButton ref={createBtnRef} icon={<FaUserPlus />} onClick={createOnOpen}
          _hover={{ bg: 'grey.300', cursor: 'pointer' }} />
        <CreateUser isOpen={createIsOpen} onClose={createOnClose} btnRef={createBtnRef} />
      </>
    )
  }
}

export default User;
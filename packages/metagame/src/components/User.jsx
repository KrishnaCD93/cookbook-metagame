import React, { useEffect, useRef, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useAccount } from 'wagmi'
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { scale } from "@cloudinary/url-gen/actions/resize";
import CreateUser from './container/CreateUser'
import { useDisclosure } from '@chakra-ui/hooks';
import { Box, Icon, IconButton } from '@chakra-ui/react';
import { FaUserCircle, FaUserPlus } from 'react-icons/fa';
import UpdateUser from './container/UpdateUser';

const GET_USER = gql`
  query RecipeWithData($userID: String!) {
    user(userID: $userID) {
      userID
      name
      imageCid
      email
    }
  }
`;

const cld = new Cloudinary({
  cloud: {
    cloudName: 'cookbook-social'
  }
})

const User = () => {
  const { isOpen: createIsOpen, onOpen: createOnOpen, onClose: createOnClose } = useDisclosure()
  const { isOpen: updateIsOpen, onOpen: updateOnOpen, onClose: updateOnClose } = useDisclosure()
  const createBtnRef = useRef()
  const updateBtnRef = useRef()
  const { address } = useAccount()
  const [user, setUser] = useState('0x0')
  const [image, setImage] = useState(null)
  const { error, data } = useQuery(GET_USER, { variables: { userID: `${user}` } });
  useEffect(() => {
    if (address) {
      setUser(address)
    }
  }, [address])
  useEffect(() => {
    if (data && data.user && data.user.imageCid) {
      const img = cld.image(data.user.imageCid)
      img.resize(scale().width(50).height(50));
      setImage(img)
    }
  }, [data])

  if (error) console.log('user error', error)

  return ( 
    <>
    {(data && data.user) ? <>
      <Box borderRadius={50} overflow="hidden" onClick={updateOnOpen} ref={updateBtnRef}
      _hover={{ cursor: 'pointer', bg: 'grey.300' }}>
        {data.user.imageCid ? <AdvancedImage cldImg={image} /> : <Icon as={FaUserCircle} mt={2} />} 
      </Box>
      <UpdateUser isOpen={updateIsOpen} onClose={updateOnClose} btnRef={updateBtnRef} /></> :
      <>
      <IconButton ref={createBtnRef} icon={<FaUserPlus />} onClick={createOnOpen}
        _hover={{ bg: 'grey.300', cursor: 'pointer' }} />
      <CreateUser isOpen={createIsOpen} onClose={createOnClose} btnRef={createBtnRef} />
    </>}
    </>
  );
}

export default User;
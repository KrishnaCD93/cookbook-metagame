import React, { useEffect, useRef, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useAccount } from 'wagmi'
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { scale } from "@cloudinary/url-gen/actions/resize";
import CreateUser from './container/CreateUser'
import { useDisclosure } from '@chakra-ui/hooks';
import { Box, IconButton } from '@chakra-ui/react';
import { FaUserCircle, FaUserPlus } from 'react-icons/fa';

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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()
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
      {(data.user.imageCid && <Box borderRadius={50} overflow="hidden">
        <AdvancedImage cldImg={image} /></Box>) || <FaUserCircle />} </> :
    <>
    <IconButton ref={btnRef} icon={<FaUserPlus />} onClick={onOpen}
      _hover={{ bg: 'grey.300', boxShadow: 'md' }} />
    <CreateUser isOpen={isOpen} onClose={onClose} btnRef={btnRef} />
    </>}
    </>
   );
}

export default User;
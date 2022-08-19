import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Grid, HStack, IconButton, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Navbar from './components/navbar/Navbar';
import { Outlet } from 'react-router-dom';
import { FaDiscord, FaTwitter, FaUserCircle, FaUserPlus } from 'react-icons/fa';
import CreateUser from './components/CreateUser';
import { SiSubstack } from 'react-icons/si';
import { gql, useQuery } from '@apollo/client';
import { useAccount } from 'wagmi'
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { scale } from "@cloudinary/url-gen/actions/resize";

window.Buffer = window.Buffer || require("buffer").Buffer;

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

function App() {
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
    <Box textAlign="center" fontSize="xl">
      <Navbar>
        <Box>
          <ConnectButton />
        </Box>
        {(data && data.user) ? <>
          {(data.user.imageCid && <Box borderRadius={50} overflow="hidden" ml={2}>
            <AdvancedImage cldImg={image} /></Box>) || <FaUserCircle />} </> :
        <>
        <IconButton ref={btnRef} icon={<FaUserPlus />} onClick={onOpen}
          _hover={{ bg: 'grey.300', boxShadow: 'md' }} />
        <CreateUser isOpen={isOpen} onClose={onClose} btnRef={btnRef} />
        </>}
        <ColorModeSwitcher />
      </Navbar>
      <Grid minH="90vh" p={3} spacing={8}>
        <Outlet />
      </Grid>
      <Flex justifyContent="center" alignItems="center" py={4} mb={4}>
        <VStack spacing={4}>
        <Text>2022 Cookbook Social</Text>
        <HStack spacing={4}>
          <Box>
            <IconButton icon={<FaTwitter />} onClick={() => window.open('https://twitter.com/cookbook_social')} />
          </Box>
          <Box>
            <IconButton icon={<FaDiscord />} onClick={() => window.open('https://discord.gg/vXSm8f93')} />
          </Box>
          <Box>
            <IconButton icon={<SiSubstack />} onClick={() => window.open('https://cookbooksocial.substack.com/')} />
          </Box>
        </HStack>
        </VStack>
      </Flex>
    </Box>
  );
}

export default App;

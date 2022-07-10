import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Grid,
  useDisclosure,
  Button,
  Flex,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CreateRecipe from './CreateRecipe';
import CreateCookbook from './CreateCookbook';
import { useAccount } from 'wagmi';

function App() {
  const { data } = useAccount();
  const [account, setAccount] = useState(null);
  const { isOpen: recipeIsOpen, onOpen: recipeOnOpen, onClose: recipeOnClose } = useDisclosure();
  const { isOpen: cookbookIsOpen, onOpen: cookbookOnOpen, onClose: cookbookOnClose } = useDisclosure();

  useEffect(() => {
    setAccount(data);
  }, [data]);

  return (
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <Flex justifySelf="flex-end">
          <Box>
            <ConnectButton label="Sign In" />
          </Box>
          <ColorModeSwitcher />
        </Flex>
        <VStack spacing={8}>
          <Text fontSize="xl">Welcome to the Cookbook Metagame!</Text>
          {account ? (
            <>
            <Button onClick={recipeOnOpen}>Add Recipe</Button>
            <Button onClick={cookbookOnOpen}>Add Cookbook</Button>
            </>
          ) : ( <Text>Please sign in to add a recipe or cookbook</Text> )}
          <CreateRecipe isOpen={recipeIsOpen} onClose={recipeOnClose} />
          <CreateCookbook isOpen={cookbookIsOpen} onClose={cookbookOnClose} />
        </VStack>
      </Grid>
    </Box>
  );
}

export default App;

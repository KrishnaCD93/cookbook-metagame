
import NHostAuth from './NHostAuth';
import { useAuthenticationStatus, useSignOut } from '@nhost/react';
import { Button, Container, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const SignInButton = () => {
  const { isAuthenticated } = useAuthenticationStatus();
  const { signOut } = useSignOut();
  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? <ConnectButton /> : 
      <Popover>
        <PopoverTrigger>
          <Button mr={2}>{isAuthenticated ? <>Sign Out</> : <>Sign In</>}</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Authenticate</PopoverHeader>
          <PopoverBody>
            <Container centerContent>
              {(!isAuthenticated) ? 
              <>
              <NHostAuth /> 
              <ConnectButton label='Sign In With Wallet' />
              </> 
              : <Button onClick={() => signOut()}>Sign Out</Button>}
            </Container>
          </PopoverBody>
        </PopoverContent>
      </Popover>}
      </>
    );
}

export default SignInButton;
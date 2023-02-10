import NHostAuth from './NHostAuth';
import { useAuthenticationStatus, useSignOut } from '@nhost/react';
import { Button, Container, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const SignInButton = (props) => {
  const { isAuthenticated } = useAuthenticationStatus();
  const { signOut } = useSignOut();

  return (
    <Popover>
      <PopoverTrigger>
        <Button w={props.w} mr={2}>{isAuthenticated ? <>Sign Out</> : <>Sign In</>}</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Authenticate</PopoverHeader>
        <PopoverBody>
          <Container centerContent>
            {(!isAuthenticated) ? 
            <>
            <ConnectButton label='Sign In With Wallet' />
            <NHostAuth /> 
            </> 
            : <Button onClick={() => signOut()}>Sign Out</Button>}
          </Container>
        </PopoverBody>
      </PopoverContent>
    </Popover>
    );
}

export default SignInButton;
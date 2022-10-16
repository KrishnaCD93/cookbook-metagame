import { Box, Button, FormControl, Icon, Input, Link, Text, useToast } from '@chakra-ui/react';
import { useProviderLink, useSignInEmailPasswordless } from '@nhost/react';
import { FcGoogle } from 'react-icons/fc'

const NHostAuth = () => {
  const { google } = useProviderLink()
  const { signInEmailPasswordless, isLoading, isSuccess, isError, error } = useSignInEmailPasswordless()
  const toast = useToast()
  
  const onSubmit = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    await signInEmailPasswordless(email)
    
    if (isSuccess) {
      toast({
        title: "Email sent",
        description: "Check your email for a link to sign in",
        status: "success",
        duration: 9000,
        isClosable: true,
      })
    }
  }

  if (isError) {
    return (
      <>
      <Text>{error}</Text>
      </>
    )
  }

  return (
    <Box m={2} p={2}>
      <form onSubmit={onSubmit}>
        <FormControl id='email' isDisabled={isLoading || isSuccess}>
          <Input type='email' name='email' placeholder='email' />
          <Button m={2} type='submit'>📧 Sign In With Email</Button>
        </FormControl>
      </form>
      <Link href={google}><Button><Icon as={FcGoogle} /> Sign In With Google</Button></Link>
    </Box>
  );
}

export default NHostAuth;
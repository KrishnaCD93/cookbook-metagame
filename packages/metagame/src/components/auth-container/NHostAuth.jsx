import { Box, Button, Divider, FormControl, HStack, Icon, Input, Link, Text, useToast } from '@chakra-ui/react';
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
    <Box>
      <HStack>
        <Divider />
        <Text>or</Text>
        <Divider />
      </HStack>
      <form onSubmit={onSubmit}>
        <FormControl id='email' isDisabled={isLoading || isSuccess}>
          <Input type='email' name='email' placeholder='email' />
          <Button type='submit'>📧 Sign In With Email</Button>
        </FormControl>
      </form>
      <HStack>
        <Divider />
        <Text>or</Text>
        <Divider />
      </HStack>
      <Link href={google}><Button><Icon as={FcGoogle} pr={1} />Sign In With Google</Button></Link>
    </Box>
  );
}

export default NHostAuth;
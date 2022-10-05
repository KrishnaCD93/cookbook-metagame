import { Link } from '@chakra-ui/react';
import { useProviderLink } from '@nhost/react';

const NHostAuth = () => {
  const { google } = useProviderLink()

  return (
    <>
      <Link href={google}>Sign in with Google</Link>
    </>
  );
}

export default NHostAuth;
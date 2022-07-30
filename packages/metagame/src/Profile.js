import React, { useState } from 'react';
import { Box, Button, Icon, Image, Text } from '@chakra-ui/react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from 'wagmi'
import { gql, useLazyQuery } from '@apollo/client'
import { CgProfile } from 'react-icons/cg'

const GET_USER = gql`
  query Query($userID: String!) {
    user(userID: $userID) {
      userID
      signature
      name
      image
      email
    }
  }
`;

const Profile = () => {
  const { address, connector, isConnected } = useAccount()
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address })
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const [shortAddress, setShortAddress] = useState('')

  const [getUserData, { data, loading, error: userError }] = useLazyQuery(GET_USER, { variables: { userID: `${address}` } })

  if (address) setShortAddress(address.slice(0, 6) + '...' + address.slice(-4))

  const handleClick = async (connector) => {
    connect({ connector })
    if (address) getUserData()
  }

  if (isConnected && connector) {
    return (
      <Box>
        {ensAvatar && <Image src={ensAvatar} alt="ENS Avatar" />}
        {data && data.user && <Image src={data.user.image} alt="Profile Avatar" />}
        {data && !data.user && !ensAvatar && <Icon as={CgProfile} size="5x" />}
        <Text>{ensName ? `${ensName} (${shortAddress})` : shortAddress}</Text>
        <Button onClick={disconnect}>Disconnect</Button>
      </Box>
    )
  }

  return (
    <Box>
      {connectors.map((connector) => (
        <Button
          disabled={!connector.ready}
          key={connector.id}
          onClick={handleClick(connector)}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </Button>
      ))}

      {error && <Text>{error.message}</Text>}
    </Box>
  )
}

export default Profile;
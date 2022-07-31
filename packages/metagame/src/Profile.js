import { Box, Button, ButtonGroup } from '@chakra-ui/react'
import { useState } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from 'wagmi'

function Profile() {
  const { address, connector, isConnected } = useAccount()
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: address })
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const { disconnect } = useDisconnect()
  const [shortAddress, setShortAddress] = useState('')

  // Get the first 6 and last 4 characters of the address
  if (address) setShortAddress(address.slice(0, 6) + '...' + address.slice(-4))

  if (isConnected) {
    return (
      <Box>
        {ensAvatar && <img src={ensAvatar} alt="ENS Avatar" />}
        <Box>{ensName ? `${ensName} (${shortAddress})` : shortAddress}</Box>
        <Box>Connected to {connector.name}</Box>
        <Button onClick={disconnect}>Disconnect</Button>
      </Box>
    )
  }

  return (
    <ButtonGroup>
      {connectors.map((connector) => (
        <Button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </Button>
      ))}

      {error && <Box>{error.message}</Box>}
    </ButtonGroup>
  )
}

export default Profile;
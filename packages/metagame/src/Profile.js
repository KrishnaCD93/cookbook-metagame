import { Box, Button, ButtonGroup } from '@chakra-ui/react'
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
  
  if (isConnected) {
    const shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
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
    <Box>
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
      </ButtonGroup>

        {error && <Box>{error.message}</Box>}
    </Box>
  )
}

export default Profile;
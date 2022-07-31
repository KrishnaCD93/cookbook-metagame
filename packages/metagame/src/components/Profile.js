import { Box, Button, Icon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from 'wagmi'
import { IoWallet } from "react-icons/io5";

function Profile({ isOpen, onClose }) {
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
        <Text>{ensName ? `${ensName} (${shortAddress})` : shortAddress}</Text>
        {connector && <Text fontSize='x-small'>Connected to {connector.name}</Text>}
        <Button onClick={disconnect}>Disconnect</Button>
      </Box>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect to a Metagame Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={8} align="center">
            {connectors.map((connector) => (
              <Button
                disabled={!connector.ready}
                key={connector.id}
                onClick={() => connect({ connector })}
              >
                <Icon as={IoWallet} mr={4} />
                {connector.name}
                {!connector.ready && ' (unsupported)'}
                {isLoading &&
                  connector.id === pendingConnector?.id &&
                  ' (connecting)'}
              </Button>
            ))}
          </VStack>
          {error && <Text fontSize='sm' color='red'>{error.message}</Text>}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default Profile;
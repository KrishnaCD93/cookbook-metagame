import React, { useState } from 'react'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { Box, Image, Text } from '@chakra-ui/react';
import { useMemo } from 'react';

const ShowCookbookTokens = () => {
  const sdk = new ThirdwebSDK('polygon')
  const contractSilverSpoon = sdk.getEdition('0x0dBC9A0649EeCa0f6b2005d833A6456EC10090EE');
  const contractGoldenFork = sdk.getEdition('0xD6E240FA4AB37e6562Df167F8841619FD6Be2f90');
  const contractDiamondKnife = sdk.getEdition('0x07481149275Fd3b7505296BE6F182783A3923f7d');
  const contracts = useMemo(() => [contractSilverSpoon, contractGoldenFork, contractDiamondKnife], 
    [contractSilverSpoon, contractGoldenFork, contractDiamondKnife])
  const { address } = useAccount()
  const [userID, setUserID] = useState('0x0')
  const [userSpoons, setUserSpoons] = useState([])
  const [userForks, setUserForks] = useState([])
  const [userKnives, setUserKnives] = useState([])

  useEffect(() => {
    async function getUserNFTs() {
      const nftSpoon = await contracts[0].getOwned(address);
      const nftFork = await contracts[1].getOwned(address);
      const nftKnife = await contracts[2].getOwned(address);
      setUserSpoons(nftSpoon)
      setUserForks(nftFork)
      setUserKnives(nftKnife)
    }
    if (address) {
      setUserID(address)
      getUserNFTs()
    }
  }, [address, contracts])

  return ( 
    <>
    Cookbook Tokens
    {userID === '0x0' && <Text>Connect your wallet to see your tokens.</Text>}
    {userID !== '0x0' && (!userSpoons.length && !userForks.length && !userKnives.length) && 
    <Text>You don't have any tokens yet.<br />Purchase a token to support your favourite chefs' cookbooks.</Text>}
    {userSpoons && userSpoons.map((nft) => (
      <Box p={2} m={2} key={nft.id}>
        {nft.metadata.name} 
        <Image boxSize='md' src={nft.metadata.image} />
        {nft.metadata.external_url}
      </Box>
    ))}
    {userForks && userForks.map((nft) => (
      <Box p={2} m={2} key={nft.id}>
        {nft.metadata.name}
        {nft.metadata.description}
        <Image boxSize='md' src={nft.metadata.image} />
        {nft.metadata.external_url}
      </Box>
    ))}
    {userKnives && userKnives.map((nft) => (
      <Box p={2} m={2} key={nft.id}>
        {nft.metadata.name}
        {nft.metadata.description}
        <Image boxSize='md' src={nft.metadata.image} />
        {nft.metadata.external_url}
      </Box>
    ))}
    </>
  );
}

export default ShowCookbookTokens;
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import cookbookGoals from '../utils/CookbookGoals.json';
import { ethers } from 'ethers';
import { Box, Button, Container, Grid, GridItem, Image, Text, useToast } from '@chakra-ui/react';

const contractAddress = '0xe92db81b284583d8c02664ea0bf5772100e048f8';

const CookbookGoals = () => {
  const { address } = useAccount();
  const [userID, setUserID] = useState(null);
  const [userGoal, setUserGoal] = useState(null);


  useEffect(() => {
    if (address) {
      setUserID(address);
    }
  }, [address]);

  useEffect(() => {
    const fetchUserGoal = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const goalContract = new ethers.Contract(contractAddress, cookbookGoals.abi, signer);
        console.log('goalContract', goalContract);
        const txn = await goalContract.checkIfUserHasNFT();
        console.log('txn', txn);
        if (txn.name) {
          console.log('User has NFT');
          setUserGoal(transformGoalData(txn));
        } else {
          console.log('No NFT found');
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    if (userID) {
      console.log('userID', userID);
      fetchUserGoal();
    }
  }, [userID]);

  return ( 
    <Box>
      Cookbook Goals
      <SelectGoal setUserGoal={setUserGoal} />
    </Box> 
  );
}

const SelectGoal = ({ setUserGoal }) => {
  const [goals, setGoals] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintLoading, setMintLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(contractAddress, cookbookGoals.abi, signer);
      console.log('gameContract', gameContract);
      setGameContract(gameContract);
    } else {
      console.log('no ethereum object found');
    }
  }, []);

  useEffect(() => {
    const getAllGoals = async () => {
      try {
        const goalsTxn = await gameContract.getAllGoals();
        const goals = goalsTxn.map((goal) => {
          return transformGoalData(goal);
        });
        setGoals(goals);
        console.log('goals', goals);
      } catch (error) {
        console.log('error', error);
      }
    }
    const onGoalMint = async (sender, tokenId, goalId) => {
      console.log(`Goal minted. Sender: ${sender}, tokenId: ${tokenId.toNumber()}, goalId: ${goalId.toNumber()}`);
      if (gameContract) {
        const userNFT = await gameContract.checkIfUserHasNFT();
        console.log('userNFT', userNFT);
        setUserGoal(transformGoalData(userNFT));
        setMintLoading(false);
        toast({
          title: 'Goal Minted',
          description: 'Your goal has been minted',
          status: 'success',
          duration: 5000,
          isClosable: true
        })
      }
    }
    if (gameContract) {
      getAllGoals();
      gameContract.on('GoalNFTMinted', onGoalMint);
    }
    return () => {
      if (gameContract) {
        gameContract.off('GoalNFTlMinted', onGoalMint);
      }
    }
  }, [gameContract, setUserGoal, toast]);
  
  const mintAGoal = async (goalID) => {
    try {
      setMintLoading(true);
      const txn = await gameContract.mintGoalNFT(goalID);
      await txn.wait();
      console.log('txn', txn);
    } catch (error) {
      console.log('error', error);
    }
  }
  const renderGoals = (goals) => {
    return (
      <Grid templateColumns="repeat(autofit, minmax(200px, 1fr))">
        {goals.length > 0 && goals.map((goal, index) => {
          return (
            <GridItem key={index}>
              <Text>{goal.name}</Text>
              <Image boxSize='150px' src={goal.imageURI} alt={goal.name} />
              <Button isLoading={mintLoading} onClick={() => mintAGoal(index)}>Claim</Button>
            </GridItem>
          );
        })}
      </Grid>
    )
  }
  return (
    <Container>
      <Text as='b'>Select A Goal</Text>
      {goals && renderGoals(goals)}
    </Container>
  );
}



const transformGoalData = (goalData) => {
  return {
    name: goalData.name,
    goalType: goalData.goalType,
    imageURI: goalData.imageURI,
    progress: goalData.progress,
    goalTotal: goalData.goalTotal,
    rewardXP: goalData.rewardXP,
  }
}


export default CookbookGoals;
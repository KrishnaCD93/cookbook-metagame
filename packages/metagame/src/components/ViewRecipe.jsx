import { Box, Checkbox, Divider, Grid, GridItem, Icon, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { FaComment } from "react-icons/fa";
import React from 'react'

const Recipe = ({ recipeData, ingredients, steps, tasteProfile }) => {
  return (
    <>
    <VStack spacing={4} align="center" divider={<Divider />}>
      {recipeData && recipeData.description && <Text fontSize="large">{recipeData.description}</Text>}
      {tasteProfile && <TasteProfile tasteProfile={tasteProfile} />}
      {ingredients && <>
        <Text as='b' fontSize="large">Ingredients</Text>
        <Ingredients ingredients={ingredients} />
      </>}
      {steps && <>
        <Text as='b' fontSize="large">Steps</Text>
        <Steps steps={steps} />
      </>}
      {recipeData && recipeData.equipment && <>
        <Text as='b' fontSize="large">Equipment</Text>
        {recipeData.equipment.split(',').map((equipment, index) => (
          <Text key={index}>{equipment}</Text>
        ))}
      </>}
      {recipeData && recipeData.qualityTags && 
        <>
        <Text as='b' fontSize="large">Quality Tags</Text>
        {recipeData.qualityTags.split(',').map((tag, index) => (
        <Text key={index}>{tag}</Text>
        ))}
        </>}
      {recipeData && recipeData.userID && <Text>Created by {recipeData.userID}</Text>}
      {recipeData && recipeData.createdAt && <Text fontSize="md">Created On: {recipeData.createdAt.split("T")[0]}</Text>}
    </VStack>
    </>
  )
}

const Ingredients = ({ ingredients }) => {
  return (
    <>
    <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={4}>
    {ingredients && ingredients.map((ingredient, index) => (
    <GridItem key={index} spacing={4} align="center" boxShadow='md' borderRadius={2} _hover={{ cursor: 'pointer', boxShadow: 'dark-lg' }}>
      <Popover>
        <PopoverTrigger>
          <Box fontSize="md" m={2}>
            <Text>{ingredient.quantity}</Text>
            <Text>{ingredient.name}</Text>
            {ingredient.comments && <Icon as={FaComment} />}
          </Box>
        </PopoverTrigger>
        {ingredient.comments && <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Text fontSize="md">{ingredient.name}</Text>
          </PopoverHeader>
          <PopoverBody>
            <Text fontSize="md">Comments: {ingredient.comments}</Text>
          </PopoverBody>
        </PopoverContent>}
      </Popover>
    </GridItem>
    ))}
    </Grid>
    </>
  );
}

const Steps = ({ steps }) => {
  return (
    <>
    <Wrap spacing={4}>
    {steps && steps.map((step, index) => (
    <WrapItem key={index} spacing={4} alignItems="center" boxShadow="sm" justifyContent="center" align='center'>
      <Box>
        <Text fontSize="md">{index + 1}</Text>
        {step.stepName && <Text fontSize="md">{step.stepName}</Text>}
        <Checkbox />
      </Box>
      <Box m={2} p={2}>
        <Text fontSize='md'>{step.action}</Text>
      {step.trigger && 
        <Text fontSize='md'>{step.trigger}</Text>}
      {step.comments && 
        <Text fontSize='md'>{step.comments}</Text>}
      </Box>
    </WrapItem>
    ))}
    </Wrap>
    </>
  );
}

const TasteProfile = ({ tasteProfile }) => {
  return (
    <>
    {tasteProfile &&
    <>
      <Text as='b' fontSize="large">Taste Profile</Text>
      <Grid gridTemplateColumns={['1fr', '1fr 1fr']} gridGap={4}>
        <GridItem><Text fontSize="md">Salt: {tasteProfile.salt}</Text></GridItem>
        <GridItem><Text fontSize="md">Sweet: {tasteProfile.sweet}</Text></GridItem>
        <GridItem><Text fontSize="md">Sour: {tasteProfile.sour}</Text></GridItem>
        <GridItem><Text fontSize="md">Bitter: {tasteProfile.bitter}</Text></GridItem>
        <GridItem><Text fontSize="md">Spice: {tasteProfile.spice}</Text></GridItem>
        <GridItem><Text fontSize="md">Umami: {tasteProfile.umami ? tasteProfile.umami : 0}</Text></GridItem>
      </Grid>
    </>
    }
    </>
  );
}

export default Recipe;
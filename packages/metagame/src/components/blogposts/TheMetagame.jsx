import { Box, Container, Heading, UnorderedList, ListItem, Text } from '@chakra-ui/react';
import React from 'react';

const TheMetagame = () => {
  return ( 
    <Container textAlign='left'>
      <Container>
        <Text as='b'>
          Welcome to Cookbook Social!
        </Text>
      </Container>
      <br />
      <Container>
        Cookbook Social is a metagame aimed at decentralizing our recipes and diversifying our Cookbooks. 
        The premise is this: as you try out new recipes, your metakitchen grows and curates to your taste profile. 
        The game's goal is to maximize the number of users contributing their tastes and sharing new recipes to the website.
      </Container>
      <br />
      <Container>
        <Text as='b'>The metagame</Text>
        <Text>
          A metagame is a game we play to record and share our attempts at self-improvement in our daily lives. 
          The cooking metagame is designed to get us to try out new cooking styles from around the world and diversify our palettes. 
          It is a game we can play to find out our taste profiles and improve our lifestyles.
        </Text>
        
        <Text>
          The items we use in this game are recipes, metakitchens, and gift tokens. 
          The Social Cookbook is a Metaverse where foodies share recipe ideas. 
          A metakitchen is a live object that changes and grows based on its owner’s recipes. The taste profile, ingredients, and steps of recipes combine to create a chef’s meta. 
          Other players can purchase gift tokens for chefs to show appreciation for recipe ideas.
        </Text>
      </Container>
      <br />
      <Container>
        <Text as='b'>Cookbooks</Text>
        <Text>
          Cookbooks are recipe collections shared with the internet. 
          In the Cookbook, the chef shares their meta - how they make the recipes - by sharing learned skills, helpful tips and tricks, and meal ideas. 
          A recipe NFT is created for each recipe added to the Cookbook, and a token gets generated as a function of the recipe’s taste profile. 
          Each recipe page in the Cookbook will be interactive and allow visitors to socialize about the ideas in the recipes.
        </Text>
      </Container>
      <br />
      <Container>
        <Text as='b'>Recipes</Text>
        <Text>
          The recipe is the first item a player will create. 
          Each recipe has a taste profile that describes its taste and provides insight for foodies perusing the Cookbook for meal ideas. 
          The recipe can be any media stored on a file storage solution, while the token pointing to the recipe represents its taste profile and is owned by its chef. 
          Taste profiles for each recipe include salt, sweet, sour, bitter, spice, and umami. 
        </Text>
        <Text>
          There are two ways to add a recipe: through the recipe builder form or by adding an external link. 
          Recipes added through the builder form will be shared to the metaverse, while recipes added with an external link will only appear in a player’s kitchen. 
          </Text>
      </Container>
      <br />
      <Container>
        <Text as='b'>Metakitchens</Text>
        <Text>
          The metakitchen is a representation of its owners’ taste profile. 
          The metakitchen reads the data emitted from the Cookbooks and shows the ingredients, steps, and recipe notes. 
          It visually represents its owner’s cooking skills and taste profile. 
          The kitchen includes a wall of visitors who subscribe to its owners' recipe taste.
        </Text>
        <Text>
          The metakitchen will also be able to keep track of any goals you set, the progress made, competition participation, and the various purchased NFTs. 
          Achievements and rewards can be displayed in your metakitchen, along with a list of ingredients, steps, and taste profiles to create new recipes quickly and easily.
        </Text>
        <Text>
          The kitchen grows as you gain skills and achievements to symbolize the experience gained through the app. 
          The experience levels are divided as follows:
        </Text>
        <Box>
          <UnorderedList>
            <ListItem>Foodie</ListItem>
            <ListItem>Pro</ListItem>
            <ListItem>Cook</ListItem>
            <ListItem>Chef</ListItem>
            <ListItem>Master Chef</ListItem>
          </UnorderedList>
        </Box>
      </Container>
      <br />
      <Container>
        <Text as='b'>Gift Tokens</Text>
        <Text>
          Gift tokens are the primary form of transaction between users in the metaverse. 
          A visitor to a Cookbook can purchase a gift token, receive a badge, and add their name to the owner’s metakitchen. 
          The token purchase represents the value a metakitchen provides to a visitor.
        </Text>
      </Container>
      <br />
      <Container>
        <Text as='b'>Social Clubs</Text>
        <Text>
          Social clubs run contests and use protocols to host competitions and provide governance for running and growing the organization. 
          Users can pool together to create competitions, award prizes, and create proposals that will shape the future of the Cookbook.
        </Text>
      </Container>
      <br />
      <Container>
        <Heading>Rules of the game</Heading>
        <Text>
          Since this is a metagame designed to help you cook for yourself, there are only three rules to this game:
        </Text>
        <Box>
          <UnorderedList>
            <ListItem>Recipes must be about food and drinks.</ListItem>
            <ListItem>Recipes must have a taste profile.</ListItem>
            <ListItem>If you find new skills or strategies for making your recipes, you must add them to the Cookbook to share your learnings with the internet.</ListItem>
          </UnorderedList>
        </Box>
      </Container>
      <br />
      <Container>
      <Text as='b'>Rewards</Text>
        <Text>
          The rewards for playing the game are the following:
        </Text>
        <Box>
          <UnorderedList>
            <ListItem>Rewards to Chef: building a MetaKitchen, gift tokens ($), data on tastes and demand.</ListItem>
            <ListItem>Rewards to Visitors: badges for leaderboard, discovery (guided), history, XP/tiers/levels/achievements.</ListItem>
            <ListItem>Rewards to Social Clubs: governance, competitions, prizes, and more.</ListItem>
          </UnorderedList>
        </Box>
      </Container>
      <br />
      <Container>
        <Text as='b'>XP/levels</Text>
        <Text>
          The experience points (XP) system is designed to reward players for their contributions to the metaverse.
        </Text>
        <Box>
          <UnorderedList>
            <ListItem>Earn XP by adding recipes to the Cookbook.</ListItem>
            <ListItem>Earn achievements by meeting your health targets.</ListItem>
            <ListItem>Win tokens by participating in competitions.</ListItem>
          </UnorderedList>
        </Box>
      </Container>
    </Container> 
  );
}

export default TheMetagame;
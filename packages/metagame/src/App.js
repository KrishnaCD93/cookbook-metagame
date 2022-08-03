import React from 'react';
import { Box, Grid } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Navbar from './components/navbar/Navbar';
import { Outlet } from 'react-router-dom';

window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {

  return (
    <Box textAlign="center" fontSize="xl">
      <Navbar>
        <Box>
          <ConnectButton />
        </Box>
        <ColorModeSwitcher />
      </Navbar>
      <Grid minH="100vh" p={3} spacing={8}>
        <Outlet />
      </Grid>
    </Box>
  );
}

export default App;

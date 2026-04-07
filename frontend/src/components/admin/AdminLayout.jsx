import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import AdminSidebar from './AdminSidebar';
import { useMediaQuery, useTheme } from '@mui/material';

const SIDEBAR_WIDTH = 260;

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <AdminSidebar mobileOpen={mobileOpen} handleDrawerToggle={() => setMobileOpen(!mobileOpen)} />

      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          minWidth: 0, 
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` }, 
          mt: { xs:'50px',sm: '60px', md: 0 },
          p: { xs: 0, md: 3 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Paper 
          elevation={0}
          sx={isSmallScreen?{
            p: { xs: 1, md: 4 },
            pt:{xs:2,md:4},
            borderRadius: { xs: 2, md: 6 },
            border: '1px solid',
            borderColor: { xs: "#fff", md: "divider" },
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            flexGrow:1
          }:{ 
            p: { xs: 2, md: 4 }, 
            borderRadius: { xs: 2, md: 6 },
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            minHeight: 'calc(100vh - 115px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
}
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link, useRouterState } from '@tanstack/react-router';
import { FiSearch, FiMenu } from 'react-icons/fi';

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/' },
  { label: 'Applications', to: '/applications' },
  { label: 'Advanced Search', to: '/advanced-search' },
  { label: 'Trends', to: '/trends' },
  { label: 'Settings', to: '/settings' },
];

const AppHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const isActiveRoute = (to: string) => {
    if (to === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(to);
  };

  const NavLinks = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveRoute(item.to);

        const isDashboard = item.to === '/';
        return (
          <Link
            key={item.to}
            to={item.to as any}
            preload={isDashboard ? false : undefined}
            style={{ textDecoration: 'none' }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                textDecoration: 'none',
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                backgroundColor: isActive 
                  ? theme.palette.mode === 'dark' 
                    ? 'rgba(25, 118, 210, 0.15)' 
                    : 'rgba(25, 118, 210, 0.08)'
                  : 'transparent',
                fontWeight: 500,
                fontSize: '0.875rem',
                transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)',
                  color: theme.palette.primary.main,
                },
              }}
            >
              {item.label}
            </Box>
          </Link>
        );
      })}
    </Box>
  );

  const MobileDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          width: 280,
        },
      }}
    >
      <Box sx={{ pt: 2, pb: 1, px: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          Navigation
        </Typography>
      </Box>
      <List>
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(item.to);

          const isDashboard = item.to === '/';
          return (
            <Link
              key={item.to}
              to={item.to as any}
              preload={isDashboard ? false : undefined}
              style={{ textDecoration: 'none' }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  onClick={toggleDrawer(false)}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    backgroundColor: isActive 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(25, 118, 210, 0.15)' 
                        : 'rgba(25, 118, 210, 0.08)'
                      : 'transparent',
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          );
        })}
      </List>
    </Drawer>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(26, 26, 46, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1280,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          minHeight: { xs: 56, sm: 64 },
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            color: theme.palette.text.primary,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            flexShrink: 0,
          }}
        >
          Screen Time
        </Typography>

        {!isMobile && (
          <TextField
            placeholder="Search..."
            size="small"
            sx={{
              width: { sm: 200, md: 280, lg: 320 },
              mx: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.03)',
                borderRadius: 3,
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.divider,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1,
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
                py: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch 
                    style={{ 
                      color: theme.palette.text.secondary, 
                      fontSize: '1.2rem' 
                    }} 
                  />
                </InputAdornment>
              ),
            }}
          />
        )}

        {isMobile ? (
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ color: theme.palette.text.primary }}
          >
            <FiMenu />
          </IconButton>
        ) : (
          <NavLinks />
        )}
      </Toolbar>

      <MobileDrawer />
    </AppBar>
  );
};

export default AppHeader;

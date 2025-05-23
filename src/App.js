import React, { useState } from 'react';
import { useJournal } from './context/JournalContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import JournalEntryList from './components/journal/JournalEntryList';
import JournalEntryForm from './components/journal/JournalEntryForm';
import { JournalProvider } from './context/JournalContext';
import { WebSocketProvider } from './context/WebSocketContext';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import { useWebSocket } from './context/WebSocketContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E87A41', // Kavia orange
    },
    background: {
      default: '#1A1A1A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '1.1rem',
      lineHeight: 1.5,
      color: 'rgba(255, 255, 255, 0.7)',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          padding: '10px 20px',
          fontSize: '1rem',
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundColor: '#E87A41',
          '&:hover': {
            backgroundColor: '#FF8B4D',
          },
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }
    }
  }
});

function JournalContent() {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { entries, addEntry, editEntry, deleteEntry } = useJournal();

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{
                mr: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <span style={{ color: '#E87A41' }}>*</span> KAVIA AI
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSelectedEntry(null)}
            sx={{ ml: 2 }}
          >
            New Entry
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        <Box sx={{
          pt: 10,
          pb: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: '#E87A41', fontWeight: 500 }}
            >
              Daily Journal Keeper
            </Typography>

            <Typography variant="h1" component="h1">
              My Journal Entries
            </Typography>
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4
          }}>
            {/* Left Column: Journal Entry List */}
            <Box>
              <JournalEntryList
                entries={entries}
                onEdit={(id) => {
                  const entry = entries.find(e => e.id === id);
                  setSelectedEntry(entry);
                }}
                onDelete={deleteEntry}
                onView={(id) => {
                  const entry = entries.find(e => e.id === id);
                  setSelectedEntry(entry);
                }}
              />
            </Box>

            {/* Right Column: Journal Entry Form */}
            <Box sx={{
              position: 'sticky',
              top: '80px',
              alignSelf: 'start'
            }}>
              <JournalEntryForm
                onSubmit={(formData) => {
                  if (selectedEntry) {
                    editEntry({ ...formData, id: selectedEntry.id });
                  } else {
                    addEntry(formData);
                  }
                  setSelectedEntry(null);
                }}
                initialValues={selectedEntry || undefined}
                onCancel={() => setSelectedEntry(null)}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}

function App() {
  return (
    <WebSocketProvider>
      <ConnectionStatus />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <JournalProvider>
          <JournalContent />
        </JournalProvider>
      </ThemeProvider>
    </WebSocketProvider>
  );
}

const ConnectionStatus = () => {
  const { connectionState, error } = useWebSocket();
  const [open, setOpen] = useState(true);

  const handleClose = () => setOpen(false);

  if (connectionState === 'connected') return null;

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      message={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {connectionState === 'connecting' && <CircularProgress size={20} color="inherit" />}
          <span>{error || 'Connecting to server...'}</span>
        </div>
      }
      sx={{
        '& .MuiSnackbarContent-root': {
          bgcolor: error ? '#d32f2f' : '#2196f3'
        }
      }}
    />
  );
};

export default App;

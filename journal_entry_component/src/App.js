import React, { useState } from 'react';
import { useJournal } from './context/JournalContext';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
  Button,
  Container,
  Box,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import JournalEntryList from './components/journal/JournalEntryList';
import JournalEntryForm from './components/journal/JournalEntryForm';
import { JournalProvider } from './context/JournalContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { CircularProgress, Snackbar } from '@mui/material';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { entries, addEntry, editEntry, deleteEntry } = useJournal();

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEntry(null);
  };

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
            onClick={handleOpenForm}
            sx={{ ml: 2 }}
          >
            New Entry
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{
          pt: 15,
          pb: 8,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <Typography
            variant="subtitle1"
            sx={{ color: '#E87A41', fontWeight: 500 }}
          >
            Daily Journal Keeper
          </Typography>

          <Typography variant="h1" component="h1">
            My Journal Entries
          </Typography>

          <JournalEntryList
            entries={entries}
            onEdit={(id) => {
              const entry = entries.find(e => e.id === id);
              setSelectedEntry(entry);
              setIsFormOpen(true);
            }}
            onDelete={deleteEntry}
            onView={(id) => {
              const entry = entries.find(e => e.id === id);
              setSelectedEntry(entry);
              setIsFormOpen(true);
            }}
          />
        </Box>

        <Dialog
          open={isFormOpen}
          onClose={handleCloseForm}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <JournalEntryForm
                onSubmit={(formData) => {
                  if (selectedEntry) {
                    editEntry({ ...formData, id: selectedEntry.id });
                  } else {
                    addEntry(formData);
                  }
                  handleCloseForm();
                }}
                initialValues={selectedEntry || undefined}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancel</Button>
          </DialogActions>
        </Dialog>
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
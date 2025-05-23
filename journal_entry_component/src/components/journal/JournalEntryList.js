import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './styles/JournalEntryList.css';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Toolbar,
  Stack,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import JournalEntry from './JournalEntry';

// PUBLIC_INTERFACE
const JournalEntryList = ({
  entries,
  onEdit,
  onDelete,
  onView
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [moodFilter, setMoodFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  // Get unique tags from all entries
  const allTags = useMemo(() => {
    const tags = new Set();
    entries.forEach(entry => entry.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [entries]);

  // Get unique moods from all entries
  const allMoods = useMemo(() => {
    const moods = new Set(entries.map(entry => entry.mood));
    return Array.from(moods);
  }, [entries]);

  const handleMenuOpen = (event, entryId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedEntryId(entryId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedEntryId(null);
  };

  const handleAction = (action) => {
    const handlers = {
      view: onView,
      edit: onEdit,
      delete: onDelete
    };
    if (handlers[action]) {
      handlers[action](selectedEntryId);
    }
    handleMenuClose();
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredAndSortedEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            entry.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
        const matchesTags = selectedTags.length === 0 ||
                           selectedTags.every(tag => entry.tags.includes(tag));
        return matchesSearch && matchesMood && matchesTags;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title);
        }
        return sortOrder === 'desc' ? comparison : -comparison;
      });
  }, [entries, searchQuery, moodFilter, selectedTags, sortBy, sortOrder]);

  return (
    <Box className="journal-list-container">
      <Card className="journal-list-filters" sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            {/* Search and Sort Controls */}
            <Toolbar className="journal-list-toolbar" disableGutters sx={{ gap: 2 }}>
              <TextField
                className="journal-list-search"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                </Select>
              </FormControl>
              <IconButton
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                size="small"
              >
                <SortIcon sx={{
                  transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s ease'
                }} />
              </IconButton>
            </Toolbar>

            {/* Filters */}
            <Box className="journal-list-container">
              <FormControl size="small" sx={{ minWidth: 120, mb: 1 }}>
                <InputLabel>Filter by mood</InputLabel>
                <Select
                  value={moodFilter}
                  label="Filter by mood"
                  onChange={(e) => setMoodFilter(e.target.value)}
                >
                  <MenuItem value="all">All Moods</MenuItem>
                  {allMoods.map(mood => (
                    <MenuItem key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box className="journal-list-tags">
                {allTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagToggle(tag)}
                    color={selectedTags.includes(tag) ? "primary" : "default"}
                    className="journal-list-tag"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {filteredAndSortedEntries.length === 0 ? (
        <Card className="journal-list-empty">
          <CardContent>
            <Typography variant="body1" align="center">
              {entries.length === 0
                ? "No journal entries yet. Start writing your first entry!"
                : "No entries match your search criteria."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        filteredAndSortedEntries.map((entry) => (
          <Box key={entry.id} sx={{ position: 'relative' }}>
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1
              }}
              onClick={(e) => handleMenuOpen(e, entry.id)}
            >
              <MoreVertIcon />
            </IconButton>
            <JournalEntry
              title={entry.title}
              date={entry.date}
              mood={entry.mood}
              tags={entry.tags}
              content={entry.content}
            />
          </Box>
        ))
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>View</MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

JournalEntryList.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      mood: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
      content: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
};

export default JournalEntryList;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  FormHelperText,
  IconButton,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// PUBLIC_INTERFACE
const JournalEntryForm = ({
  onSubmit,
  initialValues = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    mood: '',
    tags: [],
    content: ''
  }
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.mood) {
      newErrors.mood = 'Mood is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}
    >
      <Stack spacing={3}>
        <TextField
          label="Title"
          name="title"
          fullWidth
          required
          value={formData.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
        />

        <TextField
          label="Date"
          name="date"
          type="date"
          fullWidth
          required
          value={formData.date}
          onChange={handleChange}
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth required error={!!errors.mood}>
          <InputLabel>Mood</InputLabel>
          <Select
            name="mood"
            value={formData.mood}
            label="Mood"
            onChange={handleChange}
          >
            <MenuItem value="happy">Happy</MenuItem>
            <MenuItem value="excited">Excited</MenuItem>
            <MenuItem value="grateful">Grateful</MenuItem>
            <MenuItem value="calm">Calm</MenuItem>
            <MenuItem value="neutral">Neutral</MenuItem>
            <MenuItem value="anxious">Anxious</MenuItem>
            <MenuItem value="sad">Sad</MenuItem>
            <MenuItem value="frustrated">Frustrated</MenuItem>
          </Select>
          {errors.mood && <FormHelperText>{errors.mood}</FormHelperText>}
        </FormControl>

        <Box>
          <TextField
            label="Add Tags"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleAddTag} edge="end">
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mt: 1, mb: 2 }}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        </Box>

        <TextField
          label="Content"
          name="content"
          multiline
          rows={4}
          fullWidth
          required
          value={formData.content}
          onChange={handleChange}
          error={!!errors.content}
          helperText={errors.content}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
        >
          Save Entry
        </Button>
      </Stack>
    </Box>
  );
};

JournalEntryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    date: PropTypes.string,
    mood: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    content: PropTypes.string
  })
};

export default JournalEntryForm;

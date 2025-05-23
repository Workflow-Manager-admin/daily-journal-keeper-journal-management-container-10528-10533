import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

// PUBLIC_INTERFACE
const JournalEntryForm = ({
  onSubmit,
  onCancel,
  initialValues = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    mood: '',
    tags: [],
    content: ''
  }
}) => {
  const [mode, setMode] = useState('edit');
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

  const ViewMode = () => (
    <Stack spacing={3}>
      <Typography variant="h5">{formData.title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {new Date(formData.date).toLocaleDateString()}
      </Typography>
      <Box>
        <Chip
          label={formData.mood.charAt(0).toUpperCase() + formData.mood.slice(1)}
          color="primary"
          size="small"
          sx={{ mr: 1 }}
        />
        {formData.tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            sx={{ mr: 1 }}
          />
        ))}
      </Box>
      <Typography variant="body1">{formData.content}</Typography>
    </Stack>
  );

  return (
    <Box className="journal-form" sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Paper className="journal-form-paper" elevation={3} sx={{ p: 3, mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={mode}
            onChange={(e, newValue) => setMode(newValue)}
            aria-label="form mode tabs"
          >
            <Tab
              icon={<EditIcon />}
              iconPosition="start"
              label="Edit"
              value="edit"
            />
            <Tab
              icon={<VisibilityIcon />}
              iconPosition="start"
              label="View"
              value="view"
              disabled={!initialValues?.title}
            />
          </Tabs>
        </Box>

        {mode === 'view' ? (
          <ViewMode />
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
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
                  onBlur={handleAddTag}
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

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                {onCancel && (
                  <Button
                    onClick={() => {
                      onCancel();
                      setMode('edit');
                    }}
                    size="large"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  {initialValues?.title ? 'Update Entry' : 'Save Entry'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

JournalEntryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    date: PropTypes.string,
    mood: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    content: PropTypes.string
  })
};

export default JournalEntryForm;

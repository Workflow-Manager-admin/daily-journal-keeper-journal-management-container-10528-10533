import React from 'react';
import PropTypes from 'prop-types';
import './styles/JournalEntry.css';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';

// PUBLIC_INTERFACE
const JournalEntry = ({
  title,
  date,
  mood,
  tags,
  content
}) => {
  return (
    <Card className="journal-entry" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" className="journal-entry-title">
          {title}
        </Typography>
        <Box className="journal-entry-metadata">
          <Typography>
            {new Date(date).toLocaleDateString()}
          </Typography>
          <Typography className="journal-entry-mood">
            {mood}
          </Typography>
        </Box>
        <Box className="journal-entry-tags">
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              sx={{ mr: 1 }}
            />
          ))}
        </Box>
        <Typography variant="body1" className="journal-entry-content">
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
};

JournalEntry.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  mood: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  content: PropTypes.string.isRequired,
};

export default JournalEntry;

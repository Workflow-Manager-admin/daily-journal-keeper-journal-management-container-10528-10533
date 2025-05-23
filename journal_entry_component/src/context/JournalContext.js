import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

// Create the context
const JournalContext = createContext();

// PUBLIC_INTERFACE
export function JournalProvider({ children }) {
  /**
   * Provider component that wraps the application to provide journal functionality
   */
  const [entries, setEntries] = useState([]);

  // Add a new journal entry
  const addEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString(),
    };
    setEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  // Edit an existing journal entry
  const editEntry = (updatedEntry) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
      )
    );
  };

  // Delete a journal entry
  const deleteEntry = (id) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  };

  const value = {
    entries,
    addEntry,
    editEntry,
    deleteEntry,
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
}

JournalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// PUBLIC_INTERFACE
export function useJournal() {
  /**
   * Custom hook to access the journal context
   * @returns {Object} Journal context value containing entries and CRUD operations
   * @throws {Error} If used outside of JournalProvider
   */
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}

#!/bin/bash
cd /home/kavia/workspace/daily-journal-keeper-journal-management-container-10528-10533/journal_entry_component
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


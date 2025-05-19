import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { safeLocalStorage } from "@/lib/local-storage";
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NotesProps {
  darkMode: boolean;
}

export default function Notes({ darkMode }: NotesProps) {
  const [note, setNote] = useState<Note>(() => 
    safeLocalStorage.getItem('studyNotes', { content: '', lastEdited: new Date().toISOString() })
  );
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (!isSaved) {
        saveNote();
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [note, isSaved]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote({
      content: e.target.value,
      lastEdited: new Date().toISOString()
    });
    setIsSaved(false);
  };

  const saveNote = () => {
    safeLocalStorage.setItem('studyNotes', note);
    setIsSaved(true);
  };

  const exportNote = () => {
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_notes_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/markdown' && file.type !== 'text/plain' && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      alert('Please upload a markdown (.md) or text (.txt) file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setNote({
        content,
        lastEdited: new Date().toISOString()
      });
      saveNote();
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Study Notes</h2>
          <div className="flex gap-2">
            <span className={`text-sm ${isSaved ? 'text-green-500' : 'text-yellow-500'}`}>
              {isSaved ? 'Saved' : 'Saving...'}
            </span>
            <Button 
              onClick={exportNote} 
              variant="outline" 
              size="sm"
              className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
            >
              Export
            </Button>
            <label className="cursor-pointer">
              <Button 
                variant="outline" 
                size="sm"
                className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
                onClick={() => document.getElementById('import-notes')?.click()}
              >
                Import
              </Button>
              <input 
                type="file" 
                id="import-notes"
                onChange={importNote}
                className="hidden"
                accept=".md,.txt,text/markdown,text/plain"
              />
            </label>
          </div>
        </div>

        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Last edited: {new Date(note.lastEdited).toLocaleString()}
        </div>

        <Textarea
          value={note.content}
          onChange={handleNoteChange}
          placeholder="Start typing your study notes here... Supports markdown formatting."
          className={`w-full min-h-[400px] ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
        />

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Tip: Your notes are automatically saved as you type. Use markdown for formatting.</p>
          <ul className="list-disc ml-5 mt-2">
            <li># Heading 1, ## Heading 2</li>
            <li>**bold**, *italic*</li>
            <li>- List items</li>
            <li>[Link text](url)</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
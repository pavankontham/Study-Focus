import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { safeLocalStorage } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, Save, Download, Trash2, Edit, 
  Check, X, Copy, FileText, Tag, Search 
} from "lucide-react";

interface NotesProps {
  darkMode: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastEdited: string;
  createdAt: string;
}

export default function Notes({ darkMode }: NotesProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>(() => 
    safeLocalStorage.getItem("study-notes", [] as Note[])
  );
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [markdownView, setMarkdownView] = useState(true);
  
  // Update available tags when notes change
  useEffect(() => {
    const allTags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => allTags.add(tag));
    });
    setAvailableTags(Array.from(allTags));
    
    // Save notes to localStorage
    safeLocalStorage.setItem("study-notes", notes);
  }, [notes]);
  
  // Create a new note
  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      tags: [],
      lastEdited: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
    setEditMode(true);
    setMarkdownView(false);
  };
  
  // Delete the active note
  const deleteNote = () => {
    if (!activeNote) return;
    
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes(prev => prev.filter(note => note.id !== activeNote.id));
      setActiveNote(null);
      setEditMode(false);
      
      toast({
        title: "Note Deleted",
        description: "Your note has been permanently deleted."
      });
    }
  };
  
  // Update the active note
  const updateNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    
    const updatedNote = {
      ...activeNote,
      ...updates,
      lastEdited: new Date().toISOString()
    };
    
    setActiveNote(updatedNote);
    setNotes(prev => 
      prev.map(note => 
        note.id === activeNote.id ? updatedNote : note
      )
    );
  };
  
  // Save the current note
  const saveNote = () => {
    setEditMode(false);
    setMarkdownView(true);
    
    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully."
    });
  };
  
  // Add a tag to the current note
  const addTag = () => {
    if (!newTagInput.trim() || !activeNote) return;
    
    // Check if tag already exists
    if (activeNote.tags.includes(newTagInput.trim())) {
      toast({
        title: "Tag Already Exists",
        description: "This tag is already added to this note.",
        variant: "destructive"
      });
      return;
    }
    
    updateNote({
      tags: [...activeNote.tags, newTagInput.trim()]
    });
    
    setNewTagInput("");
  };
  
  // Remove a tag from the current note
  const removeTag = (tagToRemove: string) => {
    if (!activeNote) return;
    
    updateNote({
      tags: activeNote.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  // Filter notes based on search term
  const filteredNotes = notes.filter(note => {
    if (!searchTerm) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(lowerSearchTerm) ||
      note.content.toLowerCase().includes(lowerSearchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
    );
  });
  
  // Export notes to a file
  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `study_notes_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Notes Exported",
      description: "Your notes have been exported successfully."
    });
  };
  
  // Copy current note to clipboard
  const copyToClipboard = () => {
    if (!activeNote) return;
    
    navigator.clipboard.writeText(activeNote.content);
    
    toast({
      title: "Copied to Clipboard",
      description: "Note content copied to clipboard."
    });
  };
  
  // Render markdown content
  const renderMarkdown = (text: string) => {
    // This is a very basic markdown renderer
    // For a production app, you would use a library like marked or react-markdown
    
    // Convert headers
    text = text.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    
    // Convert bold and italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert lists
    text = text.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Convert numbered lists
    text = text.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>\n)+/g, '<ol>$&</ol>');
    
    // Convert links
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert paragraphs
    text = text.replace(/^(?!<[a-z]).+$/gm, '<p>$&</p>');
    
    // Replace newlines with line breaks for proper HTML rendering
    text = text.replace(/\n/g, '<br />');
    
    return text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg h-full`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">Study Notes</h2>
          <div className="flex gap-2">
            <Button 
              onClick={createNewNote}
              className="flex gap-1 items-center"
            >
              <PlusCircle size={16} /> New Note
            </Button>
            <Button 
              variant="outline" 
              onClick={exportNotes}
              className="flex gap-1 items-center"
              disabled={notes.length === 0}
            >
              <Download size={16} /> Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
              />
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {availableTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant={searchTerm === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSearchTerm(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
              {filteredNotes.length > 0 ? (
                filteredNotes.map(note => (
                  <Card 
                    key={note.id} 
                    className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      activeNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
                    } ${darkMode ? 'bg-gray-700' : ''}`}
                    onClick={() => {
                      setActiveNote(note);
                      setEditMode(false);
                      setMarkdownView(true);
                    }}
                  >
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                      <CardDescription className="text-xs">
                        Last edited: {new Date(note.lastEdited).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm line-clamp-2">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto mb-2 opacity-30" size={32} />
                  <p className="text-sm">
                    {notes.length === 0
                      ? "No notes yet. Create your first note!"
                      : "No notes match your search."}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Note Editor */}
          <div className="md:col-span-2">
            {activeNote ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {editMode ? (
                    <Input
                      value={activeNote.title}
                      onChange={(e) => updateNote({ title: e.target.value })}
                      className={`text-xl font-bold ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                      placeholder="Note title"
                    />
                  ) : (
                    <h3 className="text-xl font-bold">{activeNote.title}</h3>
                  )}
                  
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <Button 
                          onClick={saveNote}
                          size="sm" 
                          className="flex items-center gap-1"
                        >
                          <Save size={16} /> Save
                        </Button>
                        <Button 
                          onClick={() => {
                            setEditMode(false);
                            setMarkdownView(true);
                            
                            // Reset any unsaved changes
                            setActiveNote(notes.find(note => note.id === activeNote.id) || null);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <X size={16} /> Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => {
                            setEditMode(true);
                            setMarkdownView(false);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Edit size={16} /> Edit
                        </Button>
                        <Button 
                          onClick={copyToClipboard}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Copy size={16} /> Copy
                        </Button>
                        <Button 
                          onClick={deleteNote}
                          size="sm"
                          variant="destructive"
                          className="flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {editMode && (
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={16} className="text-gray-500" />
                    <Input
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className={`flex-grow ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                      placeholder="Add tag and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button onClick={addTag} size="sm">Add</Button>
                  </div>
                )}
                
                {activeNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {activeNote.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className={`${editMode ? 'pr-1' : ''}`}
                      >
                        #{tag}
                        {editMode && (
                          <button 
                            onClick={() => removeTag(tag)} 
                            className="ml-1 text-gray-500 hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {editMode ? (
                  <Tabs defaultValue="write" className="w-full">
                    <TabsList className="mb-2">
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="write" className="mt-0">
                      <Textarea
                        value={activeNote.content}
                        onChange={(e) => updateNote({ content: e.target.value })}
                        className={`min-h-[400px] font-mono ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                        placeholder="Write your note here... Markdown is supported."
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-0">
                      <div 
                        className={`border rounded-md p-4 min-h-[400px] markdown-preview ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(activeNote.content) }}
                      ></div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div 
                    className={`border rounded-md p-4 min-h-[400px] markdown-preview ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(activeNote.content) }}
                  ></div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  Created: {new Date(activeNote.createdAt).toLocaleString()} • 
                  Last modified: {new Date(activeNote.lastEdited).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <FileText size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Note Selected</h3>
                <p className="text-gray-500 mb-4">Select a note from the sidebar or create a new one.</p>
                <Button onClick={createNewNote}>Create New Note</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
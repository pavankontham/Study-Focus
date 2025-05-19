import { useState } from "react";
import { motion } from "framer-motion";
import { studyResources } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { safeLocalStorage } from "@/lib/local-storage";

interface ResourcesProps {
  darkMode: boolean;
}

type ResourceType = {
  title: string;
  description: string;
  icon: string;
  link: string;
  category?: string;
};

export default function Resources({ darkMode }: ResourcesProps) {
  const savedResources = safeLocalStorage.getItem('saved-resources', [] as ResourceType[]);
  const [resources, setResources] = useState<ResourceType[]>(studyResources);
  const [savedBookmarks, setSavedBookmarks] = useState<ResourceType[]>(savedResources);
  const [searchQuery, setSearchQuery] = useState("");
  const [customLinks, setCustomLinks] = useState<ResourceType[]>(
    safeLocalStorage.getItem('custom-resources', [] as ResourceType[])
  );
  const [newResource, setNewResource] = useState<ResourceType>({
    title: "",
    description: "",
    icon: "📌",
    link: "",
    category: "Custom"
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter resources based on search query
  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a resource is already bookmarked
  const isBookmarked = (resource: ResourceType) => {
    return savedBookmarks.some((r) => r.title === resource.title);
  };

  // Toggle bookmark status
  const toggleBookmark = (resource: ResourceType) => {
    if (isBookmarked(resource)) {
      const updatedBookmarks = savedBookmarks.filter(
        (r) => r.title !== resource.title
      );
      setSavedBookmarks(updatedBookmarks);
      safeLocalStorage.setItem("saved-resources", updatedBookmarks);
    } else {
      const updatedBookmarks = [...savedBookmarks, resource];
      setSavedBookmarks(updatedBookmarks);
      safeLocalStorage.setItem("saved-resources", updatedBookmarks);
    }
  };

  // Add a new custom resource
  const addCustomResource = () => {
    if (!newResource.title || !newResource.link) return;

    if (!newResource.link.startsWith('http://') && !newResource.link.startsWith('https://')) {
      newResource.link = 'https://' + newResource.link;
    }

    const updatedCustomLinks = [...customLinks, newResource];
    setCustomLinks(updatedCustomLinks);
    safeLocalStorage.setItem("custom-resources", updatedCustomLinks);
    
    setNewResource({
      title: "",
      description: "",
      icon: "📌",
      link: "",
      category: "Custom"
    });
    
    setShowAddForm(false);
  };

  // Remove a custom resource
  const removeCustomResource = (index: number) => {
    const updatedCustomLinks = customLinks.filter((_, i) => i !== index);
    setCustomLinks(updatedCustomLinks);
    safeLocalStorage.setItem("custom-resources", updatedCustomLinks);
    
    // Also remove from bookmarks if it's there
    const removed = customLinks[index];
    if (isBookmarked(removed)) {
      toggleBookmark(removed);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6 gradient-text">Learning Resources</h2>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search for resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            <TabsTrigger value="custom">My Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource, index) => (
                  <ResourceCard
                    key={index}
                    resource={resource}
                    isBookmarked={isBookmarked(resource)}
                    onBookmark={() => toggleBookmark(resource)}
                    darkMode={darkMode}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No resources found matching your search query.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bookmarked">
            {savedBookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedBookmarks.map((resource, index) => (
                  <ResourceCard
                    key={index}
                    resource={resource}
                    isBookmarked={true}
                    onBookmark={() => toggleBookmark(resource)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Bookmark className="mx-auto mb-3 opacity-50" size={30} />
                <p>No bookmarked resources yet. Save your favorites for quick access!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="mb-4">
              {!showAddForm ? (
                <Button onClick={() => setShowAddForm(true)}>
                  Add Custom Resource
                </Button>
              ) : (
                <Card className={darkMode ? 'bg-gray-700' : ''}>
                  <CardHeader>
                    <CardTitle>Add New Resource</CardTitle>
                    <CardDescription>
                      Add your own study resources and links
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Title *
                        </label>
                        <Input
                          value={newResource.title}
                          onChange={(e) =>
                            setNewResource({ ...newResource, title: e.target.value })
                          }
                          className={darkMode ? 'bg-gray-800 border-gray-600' : ''}
                          placeholder="Resource name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <Input
                          value={newResource.description}
                          onChange={(e) =>
                            setNewResource({
                              ...newResource,
                              description: e.target.value,
                            })
                          }
                          className={darkMode ? 'bg-gray-800 border-gray-600' : ''}
                          placeholder="Brief description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          URL *
                        </label>
                        <Input
                          value={newResource.link}
                          onChange={(e) =>
                            setNewResource({ ...newResource, link: e.target.value })
                          }
                          className={darkMode ? 'bg-gray-800 border-gray-600' : ''}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Icon
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["📚", "🔗", "📝", "📌", "📖", "🧠", "⏰", "🔍"].map(
                            (icon) => (
                              <Button
                                key={icon}
                                variant={
                                  newResource.icon === icon ? "default" : "outline"
                                }
                                className="w-10 h-10"
                                onClick={() =>
                                  setNewResource({ ...newResource, icon })
                                }
                              >
                                {icon}
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addCustomResource}>
                      Save Resource
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            {customLinks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customLinks.map((resource, index) => (
                  <div key={index} className="relative">
                    <ResourceCard
                      resource={resource}
                      isBookmarked={isBookmarked(resource)}
                      onBookmark={() => toggleBookmark(resource)}
                      darkMode={darkMode}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => removeCustomResource(index)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No custom resources added yet. Add your favorite study websites!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

// Resource Card Component
function ResourceCard({
  resource,
  isBookmarked,
  onBookmark,
  darkMode,
}: {
  resource: ResourceType;
  isBookmarked: boolean;
  onBookmark: () => void;
  darkMode: boolean;
}) {
  return (
    <Card className={`h-full flex flex-col ${darkMode ? 'bg-gray-700' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{resource.icon}</span>
            <CardTitle className="text-lg">{resource.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBookmark}
            className={`h-8 w-8 ${
              isBookmarked ? "text-yellow-500" : "text-gray-400"
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck size={16} />
            ) : (
              <Bookmark size={16} />
            )}
          </Button>
        </div>
        {resource.category && (
          <div className="mt-1">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {resource.category}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {resource.description}
        </p>
      </CardContent>
      <CardFooter>
        <a
          href={resource.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Visit Resource <ExternalLink size={14} />
        </a>
      </CardFooter>
    </Card>
  );
}
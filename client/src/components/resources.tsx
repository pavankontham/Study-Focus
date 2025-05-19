import { motion } from "framer-motion";
import { studyResources } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResourcesProps {
  darkMode: boolean;
}

export default function Resources({ darkMode }: ResourcesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6"
    >
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6">Study Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyResources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-2">{resource.icon}</span>
                    {resource.name}
                  </CardTitle>
                  <CardDescription className={darkMode ? 'text-gray-300' : ''}>
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                    className="w-full"
                  >
                    Visit Resource
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 p-4 border border-dashed rounded-lg border-gray-300 dark:border-gray-600">
          <h3 className="text-lg font-semibold mb-2">Add Your Own Resources</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Coming soon: Add and manage your own custom study resources and bookmarks.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
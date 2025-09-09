import React, { useState, useContext } from 'react';
import { ResourceContext } from '../context/ResourceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Eye } from 'lucide-react';
import ConfirmRemoveDialog from './ConfirmRemoveDialog';
import { Resource } from '../types/resource';

export default function ChatBox() {
  const context = useContext(ResourceContext);

  if (!context) {
    throw new Error('ChatBox must be used within a ResourceProvider');
  }

  const { resources, setResources } = context;
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Resource[]>([]);
  const [removeDialogOpen, setRemoveDialogOpen] = useState<boolean>(false);
  const [resourceToRemove, setResourceToRemove] = useState<Resource | null>(null);

  const runSearch = (): void => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    // Search by content substring, name and tags
    const matched = resources.filter((r: Resource) => {
      const contentMatch = r.content && r.content.toLowerCase().includes(q);
      const nameMatch = r.name && r.name.toLowerCase().includes(q);
      const tagMatch = r.tags && r.tags.some((tag: string) => tag.toLowerCase().includes(q));
      return contentMatch || nameMatch || tagMatch;
    });

    setResults(matched);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      runSearch();
    }
  };

  const handleRemoveClick = (resource: Resource): void => {
    setResourceToRemove(resource);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = (): void => {
    if (resourceToRemove) {
      const updatedResources = resources.filter((res) => res.id !== resourceToRemove.id);
      setResources(updatedResources);
      sessionStorage.setItem("inkwire_resources", JSON.stringify(updatedResources));

      // Update search results
      setResults(prevResults => prevResults.filter(res => res.id !== resourceToRemove.id));
    }
    setRemoveDialogOpen(false);
    setResourceToRemove(null);
  };

  const handleCancelRemove = (): void => {
    setRemoveDialogOpen(false);
    setResourceToRemove(null);
  };

  return (
    <>
      <Card className="bg-white shadow-lg border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Search Documents
              </h2>
              <p className="text-sm text-slate-600">
                Find documents by name, content, or tags
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Search Input */}
          <div className="space-y-3">
            <Label htmlFor="search-query" className="text-sm font-medium text-slate-700">
              Search Query
            </Label>
            <div className="flex space-x-3">
              <Input
                id="search-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='e.g. "invoice", "meeting notes", or search by tags'
                className="flex-1 h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors enhanced-input"
              />
              <Button
                onClick={runSearch}
                className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 section-header">
                Search Results
              </h3>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 font-medium">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </Badge>
            </div>

            {/* Results List */}
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    {query ? 'No documents match your search criteria.' : 'Enter a search term to find documents.'}
                  </p>
                  {query && (
                    <p className="text-slate-400 text-xs mt-2">
                      Try searching by document name, content, or tags
                    </p>
                  )}
                </div>
              ) : (
                results.map((r) => (
                  <Card key={r.id} className="bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-200 transition-all duration-200 resource-card">
                    <CardContent className="p-4">
                      {/* Result Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 truncate">{r.name}</h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                          {new Date(r.uploadDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Content Preview */}
                      {r.content && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">
                          {r.content.length > 300
                            ? `${r.content.slice(0, 300)}...`
                            : r.content
                          }
                        </p>
                      )}

                      {/* Tags */}
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {r.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs border-slate-200 hover:bg-slate-50 hover:border-indigo-300 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveClick(r)}
                          className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <ConfirmRemoveDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        resource={resourceToRemove}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </>
  );
}
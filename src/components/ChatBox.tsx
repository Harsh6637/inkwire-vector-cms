import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Eye, Clock } from 'lucide-react';
import ConfirmRemoveDialog from './ConfirmRemoveDialog';
import PreviewDialog from './PreviewDialog';
import DescriptionHover from '@/utils/DescriptionHover';
import { getResourceDescription } from '@/utils/resourceHelpers';
import { useResources } from '../hooks/useResources';
import {
    vectorSearchApi,
    VectorSearchDocument,
    formatSimilarityScore,
    truncateText,
    formatDate
} from '../api/vectorSearchApi';
import './ChatBox.css';

interface ChatMessage {
    id: string;
    type: 'user' | 'ai' | 'search-results';
    content: string;
    timestamp: Date;
    searchResults?: VectorSearchDocument[];
}

export default function ChatBox() {
    const {
        resources,
        refreshResources,
        removeDialogOpen,
        resourceToRemove,
        openRemoveDialog,
        closeRemoveDialog,
        confirmRemove
    } = useResources();

    const [query, setQuery] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([{
        id: '1',
        type: 'ai',
        content: "Hi! I'm your AI assistant. I can help you search through your documents using natural language. Just ask me anything about your content!",
        timestamp: new Date()
    }]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [openPreview, setOpenPreview] = useState<boolean>(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const updateMessagesForRemovedResource = useCallback((removedResourceId: string) => {
        setMessages(prevMessages =>
            prevMessages.map(message => {
                if (message.searchResults && message.type === 'search-results') {
                    const filteredResults = message.searchResults.filter(doc => doc.resource_id !== parseInt(removedResourceId));

                    const updatedContent = filteredResults.length === 0
                        ? "All documents from this search have been removed."
                        : `I found ${filteredResults.length} relevant document${filteredResults.length === 1 ? '' : 's'} for your query. Here are the results:`;

                    return {
                        ...message,
                        content: updatedContent,
                        searchResults: filteredResults
                    };
                }
                return message;
            })
        );
    }, []);

    // auto-scroll that only triggers for new messages
    useLayoutEffect(() => {
      const container = messagesEndRef.current?.closest(
        ".custom-scrollbar"
      ) as HTMLElement | null;

      if (!container) return;

      container.scrollTop = container.scrollHeight;
    }, [messages.length]);

    useEffect(() => {
        setMessages(prevMessages =>
            prevMessages.map(message => {
                if (message.searchResults) {
                    return {
                        ...message,
                        searchResults: message.searchResults.filter(doc =>
                            resources.some(resource => parseInt(resource.id) === doc.resource_id)
                        )
                    };
                }
                return message;
            })
        );
    }, [resources]);

    const runVectorSearch = async (): Promise<void> => {
        const q = query.trim();

        if (!q || q.length === 0) {
            const warningMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'ai',
                content: 'Please enter a search query. I need something to search for!',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, warningMessage]);
            return;
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: q,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setIsSearching(true);

        try {
            await refreshResources();
            const data = await vectorSearchApi.searchDocuments(q);

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'search-results',
                content: data.documents.length > 0
                    ? `I found ${data.documents.length} relevant document${data.documents.length === 1 ? '' : 's'} for your query. Here are the results:`
                    : "I couldn't find any documents matching your query. Try rephrasing your search or using different keywords.",
                timestamp: new Date(),
                // FIXED: Filter out low-quality matches and very low similarity scores
                searchResults: data.documents.filter(doc => {
                    // Remove results with very low similarity (likely false positives)
                    const maxScore = doc.max_score || 0;
                    if (maxScore < 0.15) return false; // Filter out matches below 15%

                    // Filter out results with empty or meaningless content
                    if (!doc.chunks || doc.chunks.length === 0) return false;

                    // Check if any chunk has meaningful content
                    const hasRealContent = doc.chunks.some(chunk => {
                        const preview = chunk.preview || '';
                        const cleanPreview = preview.replace(/\*\*/g, '').trim();

                        // Skip metadata-only content
                        if (cleanPreview.startsWith('Title:') || cleanPreview.startsWith('Tags:') || cleanPreview.startsWith('Description:')) {
                            return false;
                        }

                        // Must have actual words, not just whitespace
                        return cleanPreview.length > 3 && /[a-zA-Z]{2,}/.test(cleanPreview);
                    });

                    return hasRealContent;
                })
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: `Sorry, I encountered an error while searching: ${error instanceof Error ? error.message : 'Search failed'}. Please try again.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePreview = (doc: VectorSearchDocument): void => {
        const resource = resources.find(r => parseInt(r.id) === doc.resource_id);
        if (resource) {
            // Get the actual text content - try multiple possible locations
            const textContent = resource.metadata?.text ||
                               resource.metadata?.content ||
                               resource.text ||
                               resource.content ||
                               '';

            const previewResource = {
                id: resource.id,
                name: resource.name,
                content: textContent,
                rawData: resource.metadata?.rawData || null,
                fileType: resource.metadata?.fileType || 'text/plain',
                type: resource.metadata?.fileType || 'text/plain',
                metadata: resource.metadata
            };
            setPreviewData(previewResource);
            setOpenPreview(true);
        }
    };

    const getFileType = (res: any): string => {
        const fileType = res.metadata?.fileType || res.fileType || res.type || 'Unknown';
        const cleanFileTypes: { [key: string]: string } = {
            'application/pdf': 'PDF',
            'text/plain': 'Text',
            'text/markdown': 'Markdown',
            'application/msword': 'Word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
            'application/vnd.ms-excel': 'Excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel'
        };
        return cleanFileTypes[fileType] || fileType;
    };

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <Card className="bg-white shadow-lg border-slate-200 rounded-xl overflow-hidden h-full flex flex-col">
                <div style={{ background: 'linear-gradient(to right, #eef2ff, #faf5ff)' }} className="border-b border-slate-100 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 gradient-header-icon rounded-lg flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">AI Document Assistant</h2>
                            <p className="text-xs text-slate-600">Ask me anything about your documents</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-50">
                    {messages.map((message) => (
                        <div key={message.id} className={`message-container ${message.type === 'user' ? 'user' : 'ai'}`}>
                            <div className="message-content">
                                <div className={`message-avatar ${message.type === 'user' ? 'gradient-avatar-user' : 'gradient-avatar-ai'}`}>
                                    {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                </div>
                                <div className={`message-bubble ${message.type === 'user' ? 'chat-message-user text-white' : 'chat-message-ai text-slate-800'}`}>
                                    <p className="message-text">{message.content}</p>

                                    {message.searchResults && message.searchResults.length > 0 && (
                                        <div className="search-results">
                                            {/* FIXED: Keep separate documents but deduplicate by resource_id only */}
                                            {message.searchResults
                                                .reduce((uniqueDocs, doc) => {
                                                    // Only add if we haven't seen this exact resource_id before
                                                    if (!uniqueDocs.find(d => d.resource_id === doc.resource_id)) {
                                                        uniqueDocs.push(doc);
                                                    }
                                                    return uniqueDocs;
                                                }, [] as VectorSearchDocument[])
                                                .map((doc) => {
                                                console.log("Debug: Score for document:", doc.max_score);

                                                // Find the resource to get description and publishers
                                                const resource = resources.find(r => parseInt(r.id) === doc.resource_id);

                                                return (
                                                    <Card key={doc.resource_id} className="bg-white border-slate-200 resource-card">
                                                        <CardContent className="p-3">
                                                            <div className="document-header">
                                                                <div className="document-title-section">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="document-title">{doc.resource_title}</h4>
                                                                        {/* Description hover */}
                                                                        {resource && (
                                                                            <DescriptionHover
                                                                                description={getResourceDescription(resource)}
                                                                                side="top"
                                                                                align="start"
                                                                                iconSize="sm"
                                                                                triggerClassName="text-gray-300 hover:text-indigo-500"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <Badge variant="outline" className="text-xs badge-success">
                                                                        {formatSimilarityScore(doc.max_score)}
                                                                    </Badge>
                                                                </div>
                                                                <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                                    {formatDate(doc.resource_created_at)}
                                                                </span>
                                                            </div>

                                                            <div className="document-meta">
                                                                <Badge variant="outline" className="text-xs badge-info">
                                                                    {doc.resource_type.toUpperCase()}
                                                                </Badge>
                                                                <span className="text-xs text-slate-500">
                                                                    {doc.chunk_count} matching {doc.chunk_count === 1 ? 'section' : 'sections'}
                                                                </span>
                                                            </div>

                                                            {/* Publishers */}
                                                            {resource && resource.publishers && resource.publishers.length > 0 && (
                                                                <div className="flex items-center flex-wrap gap-1 mb-2">
                                                                    <span className="text-xs font-medium text-slate-700">Publishers:</span>
                                                                    {resource.publishers.slice(0, 2).map((publisher) => (
                                                                        <Badge
                                                                            key={publisher}
                                                                            variant="secondary"
                                                                            className="bg-green-100 text-green-800 text-xs px-2 py-0.5"
                                                                        >
                                                                            {publisher}
                                                                        </Badge>
                                                                    ))}
                                                                    {resource.publishers.length > 2 && (
                                                                        <span className="text-xs text-slate-500">
                                                                            +{resource.publishers.length - 2} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Tags */}
                                                            {resource && resource.metadata?.tags && resource.metadata.tags.length > 0 && (
                                                                <div className="flex items-center flex-wrap gap-1 mb-2">
                                                                    <span className="text-xs font-medium text-slate-700">Tags:</span>
                                                                    {resource.metadata.tags.slice(0, 3).map((tag) => (
                                                                        <Badge
                                                                            key={tag}
                                                                            variant="secondary"
                                                                            className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5"
                                                                        >
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                    {resource.metadata.tags.length > 3 && (
                                                                        <span className="text-xs text-slate-500">
                                                                            +{resource.metadata.tags.length - 3} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* FIXED: Matching Content Display - Clean tile without match type badges */}
                                                            {doc.chunks && doc.chunks.length > 0 && (
                                                              <div className="space-y-2 mb-3">
                                                                <div className="text-xs font-medium text-slate-600 mb-1">
                                                                  Found {doc.chunk_count} matching {doc.chunk_count === 1 ? 'section' : 'sections'}:
                                                                </div>

                                                                {/* FIXED: Single clean tile without match type badges */}
                                                                <div className="chunk-preview bg-slate-50 p-2 rounded border border-slate-200">
                                                                  <div className="chunk-text text-xs text-slate-700 leading-relaxed">
                                                                    {doc.chunks
                                                                      .filter((chunk, index, self) =>
                                                                        // Remove duplicate chunks with same preview
                                                                        index === self.findIndex((c) => c.preview === chunk.preview)
                                                                      )
                                                                      .slice(0, 3) // Show up to 3 unique chunks
                                                                      .map((chunk) => {
                                                                        // FIXED: Truncate text to show only 3 words before and after match
                                                                        let preview = chunk.preview || '';

                                                                        if (!preview || preview.trim() === '') {
                                                                          return null;
                                                                        }

                                                                        // Skip if preview looks like metadata only
                                                                        if (preview.startsWith('Title:') || preview.startsWith('Description:') || preview.startsWith('Tags:')) {
                                                                          // Extract actual content after metadata
                                                                          const contentMatch = preview.match(/(?:Keywords:|Tags:)[^\n]*\n+(.*)/s);
                                                                          if (contentMatch && contentMatch[1] && contentMatch[1].trim()) {
                                                                            preview = contentMatch[1].trim();
                                                                          } else {
                                                                            return null; // Skip if no real content
                                                                          }
                                                                        }

                                                                        // FIXED: Create concise snippet - 3 words before, match, 3 words after
                                                                        const createConciseSnippet = (text: string) => {
                                                                          const parts = text.split(/\*\*/);
                                                                          let result = [];

                                                                          for (let i = 0; i < parts.length; i++) {
                                                                            if (i % 2 === 0) {
                                                                              // Non-highlighted text - trim to 3 words
                                                                              const words = parts[i].trim().split(/\s+/).filter(Boolean);
                                                                              if (i === 0 && words.length > 3) {
                                                                                // First part - show last 3 words
                                                                                result.push('...' + words.slice(-3).join(' ') + ' ');
                                                                              } else if (i === parts.length - 1 && words.length > 3) {
                                                                                // Last part - show first 3 words
                                                                                result.push(' ' + words.slice(0, 3).join(' ') + '...');
                                                                              } else {
                                                                                // Middle parts or short parts - keep as is
                                                                                result.push(words.join(' '));
                                                                              }
                                                                            } else {
                                                                              // Highlighted text - keep as is
                                                                              result.push(`**${parts[i]}**`);
                                                                            }
                                                                          }

                                                                          return result.join('');
                                                                        };

                                                                        const concisePreview = createConciseSnippet(preview);
                                                                        const parts = concisePreview.split(/\*\*/);

                                                                        return (
                                                                          <div key={chunk.id} className="mb-1 last:mb-0">
                                                                            <div className="text-xs leading-tight">
                                                                              {parts.map((part, index) => {
                                                                                // Odd indices are the highlighted parts
                                                                                if (index % 2 === 1) {
                                                                                  return (
                                                                                    <mark key={index} className="bg-yellow-200 font-semibold text-slate-900 px-0.5 rounded">
                                                                                      {part}
                                                                                    </mark>
                                                                                  );
                                                                                }
                                                                                return <span key={index}>{part}</span>;
                                                                              })}
                                                                            </div>
                                                                          </div>
                                                                        );
                                                                      })
                                                                      .filter(Boolean) // Remove null entries
                                                                    }

                                                                    {doc.chunk_count > 3 && (
                                                                      <div className="text-xs text-slate-500 italic mt-2 pt-2 border-t border-slate-200">
                                                                        +{doc.chunk_count - 3} more matching sections available
                                                                      </div>
                                                                    )}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handlePreview(doc)}
                                                                    className="flex-1 h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                                                                >
                                                                    <Eye className="w-3 h-3 mr-1" />Preview
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="message-time">{formatTime(message.timestamp)}</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isSearching && (
                        <div className="message-container ai">
                            <div className="message-content">
                                <div className="message-avatar gradient-avatar-ai">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="message-bubble chat-message-ai">
                                    <div className="typing-indicator">
                                        <div className="typing-dot animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="typing-dot animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="typing-dot animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <Input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), runVectorSearch())}
                            placeholder="Ask me anything about your documents..."
                            className="chat-input enhanced-input"
                            disabled={isSearching}
                        />
                        <Button
                            onClick={runVectorSearch}
                            disabled={isSearching || !query.trim()}
                            className="send-button gradient-button"
                        >
                            {isSearching ? (
                                <div className="loading-spinner animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    <p className="chat-hint">
                        Ask questions like "show me documents about machine learning" or "find available books for Maths"
                    </p>
                </div>
            </Card>

            <ConfirmRemoveDialog
                open={removeDialogOpen}
                onOpenChange={closeRemoveDialog}
                resource={resourceToRemove}
                onConfirm={() => confirmRemove(updateMessagesForRemovedResource)}
                onCancel={closeRemoveDialog}
            />

            {previewData && (
                <PreviewDialog
                    open={openPreview}
                    onClose={() => setOpenPreview(false)}
                    name={previewData.name}
                    fileType={getFileType(previewData)}
                    content={previewData.content}
                    rawData={previewData.rawData}
                />
            )}
        </>
    );
}
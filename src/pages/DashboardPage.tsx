import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Send, Download, Trash2, Eye } from "lucide-react";
import UploadForm from "../components/UploadForm";
import ResourceList from "../components/ResourceList";
import Header from "../components/Header";
import PreviewDialog from "../components/PreviewDialog";
import ConfirmRemoveDialog from "../components/ConfirmRemoveDialog";
import { Resource } from '../types/resource';

interface Message {
  role: "user" | "ai";
  text?: string;
  type?: "text" | "docs";
  docs?: Resource[];
}

interface DashboardProps {}

const DashboardPage: React.FC<DashboardProps> = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<Resource | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState<boolean>(false);
  const [resourceToRemove, setResourceToRemove] = useState<Resource | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);

  const loadResources = (): void => {
    const stored = JSON.parse(sessionStorage.getItem("resources") || "[]") as Resource[];
    setResources(stored);
  };

  useEffect(() => {
    loadResources();
    const handleStorageChange = () => loadResources();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleRemoveClick = (res: Resource): void => {
    setResourceToRemove(res);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = (): void => {
    if (resourceToRemove) {
      const updatedResources = resources.filter(
        (res) => res.id !== resourceToRemove.id
      );
      setResources(updatedResources);
      sessionStorage.setItem("resources", JSON.stringify(updatedResources));
      setMessages((prev) =>
        prev.map((m) =>
          m.type === "docs" && m.docs
            ? { ...m, docs: m.docs.filter((d) => d.id !== resourceToRemove.id) }
            : m
        )
      );
    }
    setRemoveDialogOpen(false);
    setResourceToRemove(null);
  };

  const handleCancelRemove = (): void => {
    setRemoveDialogOpen(false);
    setResourceToRemove(null);
  };

  const handlePreview = (res: Resource): void => {
    setPreviewData(res);
    setOpenPreview(true);
  };

  const handleDownload = (doc: Resource): void => {
    const link = document.createElement("a");
    link.href = doc.rawData;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = (): void => {
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    const currentQuery = query.toLowerCase();
    setQuery("");
    setLoading(true);

    const foundDocs = resources.filter(
      (doc) =>
        doc.name.toLowerCase().includes(currentQuery) ||
        (doc.tags &&
          doc.tags.some((tag) => tag.toLowerCase().includes(currentQuery)))
    );

    let aiResponse: Message;
    if (foundDocs.length > 0) {
      aiResponse = {
        role: "ai",
        type: "docs",
        docs: foundDocs,
      };
    } else {
      aiResponse = {
        role: "ai",
        type: "text",
        text: "No matching documents found for your query.",
      };
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1200);
  };

  const handleUploadSuccess = (): void => {
    setUploadDialogOpen(false);
    loadResources();
  };

  const handleCloseUploadDialog = (): void => {
    setUploadDialogOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Typing indicator component
  const TypingIndicator: React.FC = () => (
    <div className="flex items-center justify-center bg-slate-100 rounded-2xl px-3 py-2 max-w-fit">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />

      <div className="flex justify-center p-5 w-full">
        <div className="flex flex-row gap-6 p-6 w-4/5 h-[calc(100vh-5rem)] max-w-7xl">
          {/* Left Panel */}
          <div className="flex-[0_0_40%] flex flex-col gap-5 overflow-y-auto bg-white p-6 rounded-2xl shadow-lg border border-slate-100 min-w-80">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Resource
            </Button>

            <Separator className="bg-slate-200 h-0.5 rounded-full" />

            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Uploaded Resources
              </h3>
              <ResourceList
                resources={resources}
                onRemove={handleRemoveClick}
              />
            </div>

            <Separator className="bg-slate-200 h-0.5 rounded-full" />
          </div>

          {/* Right Panel - Chat */}
          <Card className="flex-[0_0_60%] flex flex-col p-6 rounded-2xl shadow-lg border border-slate-100 h-full min-w-96 bg-white">
            <CardContent className="flex flex-col h-full p-0">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-800 mb-2 relative inline-block pb-2">
                  Ask AI
                  <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                </h2>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-2 custom-scrollbar">
                {messages.length === 0 && !loading && (
                  <div className="flex items-center justify-center flex-1">
                    <p className="text-slate-500 text-center">
                      Start a conversation by asking about your documents.
                    </p>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-2xl max-w-[70%] text-sm leading-relaxed whitespace-pre-line transition-all duration-300 ${
                      m.role === "user"
                        ? "self-end bg-gradient-to-r from-indigo-600 to-purple-600 text-white chat-message-user"
                        : "self-start bg-slate-100 text-slate-800 chat-message-ai"
                    }`}
                  >
                    {m.role === "ai" && m.type === "docs" && m.docs ? (
                      <div>
                        <p className="mb-3 font-medium">Found matching documents:</p>
                        {m.docs.map((doc) => (
                          <Card key={doc.id} className="bg-white border border-slate-200 rounded-xl p-3 mb-2 shadow-sm resource-card">
                            <div className="font-medium text-slate-800 mb-2">{doc.name}</div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreview(doc)}
                                className="h-8 px-3 text-xs rounded-lg border-slate-200 hover:bg-slate-50 hover:border-indigo-300 transition-colors"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(doc)}
                                className="h-8 px-3 text-xs rounded-lg border-slate-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveClick(doc)}
                                className="h-8 px-3 text-xs rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      m.text
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="self-start">
                    <TypingIndicator />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-3 mt-2">
                <Input
                  placeholder="Ask AI..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 rounded-xl border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 h-12 enhanced-input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!query.trim() || loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl px-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12 btn-primary-gradient"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="rounded-2xl max-w-2xl w-[50vw] min-h-[50vh] bg-white p-0">
          <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-200">
                <Upload className="w-4 h-4 text-indigo-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Upload Resource
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Upload and manage document resources for your project
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <UploadForm onSuccess={handleUploadSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {previewData && (
        <PreviewDialog
          open={openPreview}
          onClose={() => setOpenPreview(false)}
          name={previewData.name}
          fileType={previewData.fileType}
          content={previewData.content}
          rawData={previewData.rawData}
        />
      )}

      {/* Remove Confirmation Dialog */}
      <ConfirmRemoveDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        resource={resourceToRemove}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </div>
  );
};

export default DashboardPage;
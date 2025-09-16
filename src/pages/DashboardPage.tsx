import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";
import UploadForm from "../components/UploadForm";
import ResourceList from "../components/ResourceList";
import Header from "../components/Header";
import PreviewDialog from "../components/PreviewDialog";
import ConfirmRemoveDialog from "../components/ConfirmRemoveDialog";
import ChatBox from "../components/ChatBox";
import { Resource } from '../types/resource';
import { ResourceContext } from '../context/ResourceContext';

interface DashboardProps {}

const DashboardPage: React.FC<DashboardProps> = () => {
  const [resources, setResources] = useState<Resource[]>([]);
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

  const handleUploadSuccess = (): void => {
    setUploadDialogOpen(false);
    loadResources();
  };

  // Resource context value for ChatBox
const resourceContextValue = {
  resources,
  setResources,
  addResource: () => {},
  removeResource: async () => {},
  isLoading: false,
  error: null,
  fetchResources: async () => {},
  hasFetched: true,
  refreshResources: () => {}
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Header />

      <div className="flex justify-center p-5 w-full">
        <div className="flex flex-row gap-6 p-6 w-4/5 h-[calc(100vh-5rem)] max-w-7xl">
          {/* Left Panel - Resource Management */}
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

          {/* Right Panel - Vector Search ChatBox */}
          <div className="flex-[0_0_60%]">
            <ResourceContext.Provider value={resourceContextValue}>
              <ChatBox />
            </ResourceContext.Provider>
          </div>
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
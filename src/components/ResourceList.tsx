import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PreviewDialog from "./PreviewDialog";
import ConfirmRemoveDialog from "./ConfirmRemoveDialog";
import DescriptionHover, { getResourceDescription } from "../utils/DescriptionHover";
import { Eye, Download, Trash2 } from "lucide-react";
import { Resource } from '../types/resource';
import { useResources } from '../hooks/useResources';
import { downloadResource } from '../utils/downloadUtils';

interface ResourceListProps {
  resources?: Resource[];
  onRemove?: (resource: Resource) => void;
  onDownload?: (resource: Resource) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({ resources: propResources, onRemove: propOnRemove, onDownload: propOnDownload }) => {
  // Use the global state from useResources hook
  const {
    resources: hookResources,
    isLoading,
    removeDialogOpen,
    resourceToRemove,
    openRemoveDialog,
    closeRemoveDialog,
    confirmRemove
  } = useResources();

  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<Resource | null>(null);

  // Use hook resources (which have rawData) instead of props
  const resources = hookResources;

  const handlePreview = (res: Resource): void => {
    // Create a preview-compatible object
    const previewResource = {
      ...res,
      content: res.metadata?.text || res.metadata?.content || res.content || '',
      rawData: res.metadata?.rawData || res.rawData || null,
      fileType: res.metadata?.fileType || res.fileType || res.type || 'text/plain'
    };

    setPreviewData(previewResource);
    setOpenPreview(true);
  };

  const handleDownload = (res: Resource): void => {
    const result = downloadResource(res);

    if (!result.success && result.error) {
      // You could replace this with a toast notification system
      alert(result.error);
    }
  };

  const handleRemoveClick = (resource: Resource): void => {
    openRemoveDialog(resource);
  };

  const getFileSize = (res: Resource): number | null => {
    // Check if metadata has fileSize (from backend)
    if (res.metadata?.fileSize && res.metadata.fileSize > 0) {
      return res.metadata.fileSize;
    }

    if (res.size && res.size > 0) {
      return res.size;
    }
    if (res.rawData) {
      try {
        const base64String = res.rawData.split(",")[1] || res.rawData;
        return Math.ceil((base64String.length * 3) / 4);
      } catch {
        return null;
      }
    }
    if (res.content) {
      return new TextEncoder().encode(res.content).length;
    }
    return null;
  };

  const formatFileSize = (size: number | null): string => {
    if (!size || isNaN(size) || size <= 0) {
      return "Unknown size";
    } else if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const getFileType = (res: Resource): string => {
    // First check metadata fileType from backend
    let fileType = res.metadata?.fileType || res.fileType || res.type || 'Unknown';

    // Convert ugly MIME types to clean, user-friendly names
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

  const getTags = (res: Resource): string[] => {
    if (res.metadata?.tags && Array.isArray(res.metadata.tags)) {
      return res.metadata.tags;
    }
    return res.tags || [];
  };

  const getPublishers = (res: Resource): string[] => {
    // Publishers from dedicated column (hybrid approach)
    if (res.publishers && Array.isArray(res.publishers)) {
      return res.publishers;
    }
    // Fallback to metadata if needed
    if (res.metadata?.publishers && Array.isArray(res.metadata.publishers)) {
      return res.metadata.publishers;
    }
    return [];
  };

  const renderResourceCard = (res: Resource): React.ReactNode => (
    <Card
      key={res.id}
      className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          {/* Left side: File details */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Resource name with info icon for description hover */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 break-words">
                {res.name}
              </h3>

              {/* Description hover using utility */}
              <DescriptionHover
                description={getResourceDescription(res)}
                side="top"
                align="start"
              />
            </div>

            {/* File info */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{getFileType(res)}</span>
              <span>•</span>
              <span>{formatFileSize(getFileSize(res))}</span>
            </div>

            {/* Publishers */}
            {getPublishers(res).length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Publishers:</span>
                {getPublishers(res).map((publisher) => (
                  <Badge
                    key={publisher}
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200 text-xs"
                  >
                    {publisher}
                  </Badge>
                ))}
              </div>
            )}

            {/* Tags */}
            {getTags(res).length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Tags:</span>
                {getTags(res).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right side: Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreview(res)}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(res)}
              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveClick(res)}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-3">
      {/* Show loading state while fetching */}
      {isLoading && resources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No resources available.</p>
        </div>
      ) : (
        resources.map(renderResourceCard)
      )}

      {/* Confirm Remove Dialog - Using global state */}
      <ConfirmRemoveDialog
        open={removeDialogOpen}
        onOpenChange={closeRemoveDialog}
        resource={resourceToRemove}
        onConfirm={confirmRemove}
        onCancel={closeRemoveDialog}
      />

      {/* Preview Dialog */}
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
    </div>
  );
};

export default ResourceList;
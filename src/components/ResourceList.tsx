import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PreviewDialog from "./PreviewDialog";
import { Eye, Trash2 } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  uploadDate: string;
  lastModified: string;
  tags?: string[];
  fileType?: string;
  rawData?: string;
}

interface ResourceListProps {
  resources?: Resource[];
  onRemove: (resource: Resource) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({ resources = [], onRemove }) => {
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<Resource | null>(null);

  const handlePreview = (res: Resource): void => {
    setPreviewData(res);
    setOpenPreview(true);
  };

  const getFileSize = (res: Resource): number | null => {
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
      // Assume UTF-8 encoding → 1 char = ~1 byte (non-ASCII may be 2–3 bytes, but good enough for display)
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

  const renderResourceCard = (res: Resource): React.ReactNode => (
    <Card
      key={res.id}
      className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          {/* Left side: File details */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 break-words">
              {res.name}
            </h3>

            {/* File info */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{res.type}</span>
              <span>•</span>
              <span>{formatFileSize(getFileSize(res))}</span>
            </div>

            {/* Tags */}
            {res.tags && res.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Tags:</span>
                {res.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs"
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
              onClick={() => onRemove(res)}
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
      {resources.length === 0 ? (
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

      {/* Preview Dialog */}
      {previewData && (
        <PreviewDialog
          open={openPreview}
          onClose={() => setOpenPreview(false)}
          name={previewData.name}
          fileType={previewData.fileType || previewData.type}
          content={previewData.content}
          rawData={previewData.rawData}
        />
      )}
    </div>
  );
};

export default ResourceList;

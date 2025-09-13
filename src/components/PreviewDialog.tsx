import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  fileType: string;
  content?: string;
  rawData?: string;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onClose,
  name,
  fileType,
  content,
  rawData
}) => {
  const getMimeType = (cleanType: string): string => {
    const mimeTypeMap: { [key: string]: string } = {
      'PDF': 'application/pdf',
      'Word': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Text': 'text/plain',
      'Markdown': 'text/markdown'
    };
    return mimeTypeMap[fileType] || fileType;
  };

  const actualFileType = getMimeType(fileType);
  let previewContent: React.ReactNode;

  if (actualFileType.startsWith("text/") && actualFileType !== "text/markdown") {
    previewContent = (
      <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
        {content}
      </div>
    );
  } else if (actualFileType === "application/pdf") {
    // Debug: Check if rawData exists and is valid
    if (!rawData) {
      previewContent = (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4 font-medium">
              PDF preview not available
            </p>
            <p className="text-gray-600 text-sm mb-4">
              PDF data was not stored properly during upload.
            </p>
            <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700">
              Close
            </Button>
          </div>
        </div>
      );
    } else {
      previewContent = (
        <div className="h-full flex flex-col">
          <object
            data={rawData}
            type="application/pdf"
            className="w-full flex-1 rounded-lg min-h-0"
            aria-label={`PDF preview of ${name}`}
          >
            <embed
              src={rawData}
              type="application/pdf"
              className="w-full h-full rounded-lg"
            />
            {/* Fallback if PDF can't be displayed */}
            <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  Could not display PDF preview in browser.
                </p>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = rawData;
                    link.download = name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-8 5h8" />
                  </svg>
                  Download {name}
                </Button>
              </div>
            </div>
          </object>
        </div>
      );
    }
  } else if (
    actualFileType === "application/msword" ||
    actualFileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType === "Word"
  ) {
    previewContent = content ? (
      <div className="h-full max-h-full overflow-y-auto whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
        {content}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            Could not extract preview for this Word document. Please download:
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <a href={rawData} download={name} className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-8 5h8" />
              </svg>
              <span>Download {name}</span>
            </a>
          </Button>
        </div>
      </div>
    );
  } else if (actualFileType === "text/markdown" || actualFileType === "application/markdown" || fileType === "Markdown") {
    previewContent = (
      <div className="h-full overflow-y-auto">
        <div className="prose prose-sm max-w-none text-gray-900 p-6">
          <ReactMarkdown>{content || ""}</ReactMarkdown>
        </div>
      </div>
    );
  } else {
    previewContent = (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">No preview available for this file type</p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 bg-white rounded-lg shadow-xl flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900 truncate pr-4 flex-1">
              {name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex-shrink-0"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Preview of {fileType === "PDF" ? "PDF document" : "file"}: {name}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex-1 min-h-0 bg-gray-50 ${
            fileType === "PDF" ||
            fileType === "Word" ||
            actualFileType === "application/pdf" ||
            actualFileType === "application/msword" ||
            actualFileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ? "px-6 py-4 overflow-y-auto"
              : "overflow-y-auto p-6"
          }`}
        >
          {previewContent}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;
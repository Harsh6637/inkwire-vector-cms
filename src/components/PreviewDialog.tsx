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
  let previewContent: React.ReactNode;

  if (fileType.startsWith("text/") && fileType !== "text/markdown") {
    previewContent = (
      <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
        {content}
      </div>
    );
  } else if (fileType === "application/pdf") {
    previewContent = (
      <object
        data={rawData}
        type="application/pdf"
        className="w-full h-full rounded-lg"
        aria-label={`PDF preview of ${name}`}
      >
        <embed
          src={rawData}
          type="application/pdf"
          className="w-full h-full rounded-lg"
        />
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              Could not display PDF preview. Please download to view:
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
      </object>
    );
  } else if (
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
  } else if (fileType === "text/markdown" || fileType === "application/markdown") {
    previewContent = (
      <div className="h-full overflow-y-auto p-6">
        <div className="prose prose-sm max-w-none text-gray-900">
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
            Preview of {fileType === "application/pdf" ? "PDF document" : "file"}: {name}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex-1 min-h-0 bg-gray-50 ${
            fileType === "application/pdf" ||
            fileType === "application/msword" ||
            fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

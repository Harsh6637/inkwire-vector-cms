import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import * as mammoth from "mammoth"; // npm install mammoth

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  name: string;
  fileType: string;
  content?: string; // extracted text from server
  rawData?: string; // base64 or public URL
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onClose,
  name,
  fileType,
  content,
  rawData
}) => {
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const getMimeType = (cleanType: string): string => {
    const mimeTypeMap: { [key: string]: string } = {
      PDF: "application/pdf",
      Word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      Text: "text/plain",
      Markdown: "text/markdown"
    };
    return mimeTypeMap[fileType] || fileType;
  };

  const actualFileType = getMimeType(fileType);

  // Client-side DOCX extraction if needed
  useEffect(() => {
    const extractFromBase64Docx = async () => {
      if (
        !content &&
        rawData &&
        rawData.startsWith("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      ) {
        try {
          const base64Data = rawData.split(",")[1];
          const arrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          if (result.value) {
            setExtractedText(result.value);
          }
        } catch (err) {
          console.error("Client-side DOCX extraction failed:", err);
        }
      }
    };
    extractFromBase64Docx();
  }, [content, rawData]);

  let previewContent: React.ReactNode;

  // Plain text
  if (actualFileType.startsWith("text/") && actualFileType !== "text/markdown") {
    previewContent = (
      <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
        {content}
      </div>
    );
  }

  // PDF
  else if (actualFileType === "application/pdf") {
    if (!rawData) {
      previewContent = (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-red-600 font-medium">PDF preview not available</p>
          <p className="text-gray-600 text-sm">
            PDF data was not stored properly during upload.
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      );
    } else {
      previewContent = (
        <div className="h-full flex flex-col">
          <object
            data={rawData}
            type="application/pdf"
            className="w-full flex-1 rounded-lg min-h-0"
          >
            <embed
              src={rawData}
              type="application/pdf"
              className="w-full h-full rounded-lg"
            />
          </object>
        </div>
      );
    }
  }

  // Word documents
  else if (
    actualFileType === "application/msword" ||
    actualFileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType === "Word"
  ) {
    const textToShow = content || extractedText || '';

    if (textToShow) {
      previewContent = (
        <div className="h-full max-h-full overflow-y-auto p-6 bg-white">
          <div
            style={{
              whiteSpace: 'pre-line',
              fontFamily: 'Calibri, sans-serif',
              fontSize: '11pt',
              lineHeight: '1.5'
            }}
          >
            {textToShow}
          </div>
        </div>
      );
    } else if (rawData) {
      previewContent = (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-gray-600 mb-4">
            Could not extract preview for this Word document. Please download:
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <a href={rawData} download={name} className="flex items-center space-x-2">
              <span>Download {name}</span>
            </a>
          </Button>
        </div>
      );
    } else {
      previewContent = (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-gray-600 mb-4">
            No preview available for this Word document.
          </p>
        </div>
      );
    }
  }

  // Markdown
  else if (
    actualFileType === "text/markdown" ||
    actualFileType === "application/markdown" ||
    fileType === "Markdown"
  ) {
    previewContent = (
      <div className="h-full overflow-y-auto">
        <div className="prose prose-sm max-w-none text-gray-900 p-6">
          <ReactMarkdown>{content || ""}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // Unsupported
  else {
    previewContent = (
      <div className="h-full flex flex-col items-center justify-center p-6">
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
            Preview of {fileType}: {name}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex-1 min-h-0 bg-gray-50 ${
            ["PDF", "Word"].includes(fileType) ||
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

export default PreviewDialog
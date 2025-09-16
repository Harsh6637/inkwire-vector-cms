import React, { useState } from "react";
import mammoth from "mammoth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, X } from "lucide-react";
import { resourceApi } from "../api/resourceApi";
import { useResources } from '../hooks/useResources';

interface UploadFormProps {
  onSuccess?: () => void;
}

interface FileErrors {
  file: string;
  displayName: string;
  tags: string;
}

interface FileContent {
  content: string;
  rawData: string | null;
  fileType: string;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const { refreshResources } = useResources();
  const [file, setFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [nameOverride, setNameOverride] = useState<string>("");
  const [errors, setErrors] = useState<FileErrors>({ file: "", displayName: "", tags: "" });
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowedExtensions = [".pdf", ".txt", ".md", ".doc", ".docx"];

  const stripExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? filename : filename.substring(0, lastDot);
  };

  const handleFileChange = (f: File | null): void => {
    if (!f) return;

    const MAX_SIZE_MB = 10;
    if (f.size / 1024 / 1024 > MAX_SIZE_MB) {
      setFile(null);
      setErrors((prev) => ({
        ...prev,
        file: `File size exceeds ${MAX_SIZE_MB} MB. Please select a smaller file.`,
      }));
      return;
    }

    const fileExt = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    const isAllowed = allowedTypes.includes(f.type) || allowedExtensions.includes(fileExt);

    if (!isAllowed) {
      setFile(null);
      setErrors((prev) => ({
        ...prev,
        file: `Unsupported file type: ${f.name}. Allowed types are PDF, TXT, MD, DOC, DOCX.`,
      }));
      return;
    }

    setFile(f);
    if (f) setNameOverride(stripExtension(f.name));
    setErrors((prev) => ({ ...prev, file: "", displayName: "" }));

    const input = document.getElementById("file-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const f = e.target.files?.[0];
    if (f) handleFileChange(f);
  };

  const handleAddTag = (): void => {
    const t = tagsInput.trim();
    if (!t) return;
    const newTags = t.split(",").map((x) => x.trim()).filter(Boolean);
    setTags((prev) => Array.from(new Set([...prev, ...newTags])));
    setTagsInput("");
    setErrors((prev) => ({ ...prev, tags: "" }));
  };

  const handleRemoveTag = (t: string): void => setTags((prev) => prev.filter((x) => x !== t));

  const readAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const extractPDFText = async (file: File): Promise<string> => {
    try {
      return `PDF Document: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: PDF Document\nPages: Unable to determine page count without full PDF parsing.\n\nNote: This PDF has been uploaded successfully. Full text extraction from PDFs requires additional server-side processing.`;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      return `PDF Document: ${file.name}\nText extraction failed, but file uploaded successfully.`;
    }
  };

  const readFileContent = async (f: File): Promise<FileContent> => {
    if (!f) return { content: "", rawData: null, fileType: "unknown" };

    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();

    if (f.type === "text/markdown" || ext === ".md") {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const markdownContent = reader.result as string;
          resolve({
            content: markdownContent,
            rawData: null,
            fileType: "text/markdown"
          });
        };
        reader.readAsText(f);
      });
    }

    if (f.type === "text/plain" || ext === ".txt") {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const textContent = reader.result as string;
          resolve({
            content: textContent,
            rawData: null,
            fileType: "text/plain"
          });
        };
        reader.readAsText(f);
      });
    }

    if (
      f.type === "application/msword" ||
      f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === ".doc" ||
      ext === ".docx"
    ) {
      try {
        const arrayBuffer = await f.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const rawData = await readAsDataURL(f);

        return {
          content: result.value || `Word Document: ${f.name}\nText extraction failed, but file uploaded successfully.`,
          rawData,
          fileType: f.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
      } catch (err) {
        console.error("Error extracting Word text:", err);
        const rawData = await readAsDataURL(f);
        return {
          content: `Word Document: ${f.name}\nText extraction failed, but file uploaded successfully.`,
          rawData,
          fileType: f.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
      }
    }

    if (f.type === "application/pdf" || ext === ".pdf") {
      try {
        const rawData = await readAsDataURL(f);
        const extractedText = await extractPDFText(f);

        return {
          content: extractedText,
          rawData,
          fileType: "application/pdf",
        };
      } catch (err) {
        console.error("Error processing PDF:", err);
        const rawData = await readAsDataURL(f);
        return {
          content: `PDF Document: ${f.name}\nProcessing failed, but file uploaded successfully.`,
          rawData,
          fileType: "application/pdf",
        };
      }
    }

    const rawData = await readAsDataURL(f);
    return {
      content: `File: ${f.name}\nType: ${f.type}\nSize: ${(f.size / 1024).toFixed(1)} KB`,
      rawData,
      fileType: f.type || "application/octet-stream",
    };
  };

  const handleUpload = async (): Promise<void> => {
    let hasError = false;
    const newErrors: FileErrors = { file: "", displayName: "", tags: "" };

    if (!file) {
      newErrors.file = "Please select a valid file to upload.";
      hasError = true;
    }
    if (!nameOverride.trim()) {
      newErrors.displayName = "Display name is required.";
      hasError = true;
    }
    if (tags.length === 0) {
      newErrors.tags = "At least one tag is required.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setIsUploading(true);

    try {
      const { content, rawData, fileType } = await readFileContent(file!);

      const metadata = {
        originalFileName: file!.name,
        fileType,
        fileSize: file!.size,
        tags,
        uploadDate: new Date().toISOString(),
        ...(rawData && { rawData })
      };

      const response = await resourceApi.create({
        name: nameOverride.trim(),
        metadata,
        text: content
      });

      // Force refresh all components to show the new resource
      await refreshResources();

      // Reset form
      setFile(null);
      setTags([]);
      setTagsInput("");
      setNameOverride("");
      setErrors({ file: "", displayName: "", tags: "" });

      const input = document.getElementById("file-input") as HTMLInputElement;
      if (input) input.value = "";

      if (typeof onSuccess === "function") {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Upload API Error:', error);
      setErrors((prev) => ({
        ...prev,
        file: error.message || 'Upload failed. Please try again.'
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="space-y-3">
        <input
          id="file-input"
          type="file"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        <div
          onClick={() => !isUploading && document.getElementById("file-input")?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isUploading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30'
          }`}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className={`w-6 h-6 ${isUploading ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="text-sm text-gray-600">
              {file ? (
                <span className="font-medium text-indigo-600">Selected: {file.name}</span>
              ) : (
                <span>{isUploading ? 'Uploading...' : 'Click to select a file or drag and drop'}</span>
              )}
            </div>
          </div>
        </div>

        {errors.file && (
          <p className="text-sm text-red-600">{errors.file}</p>
        )}
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="display-name" className="text-sm font-medium text-gray-700">
          Display Name *
        </Label>
        <Input
          id="display-name"
          type="text"
          value={nameOverride}
          onChange={(e) => setNameOverride(e.target.value)}
          placeholder="Enter a display name for this resource"
          className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          disabled={isUploading}
        />
        {errors.displayName && (
          <p className="text-sm text-red-600">{errors.displayName}</p>
        )}
      </div>

      {/* Tags Input */}
      <div className="space-y-3">
        <Label htmlFor="tags-input" className="text-sm font-medium text-gray-700">
          Tags *
        </Label>
        <div className="flex gap-2">
          <Input
            id="tags-input"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add tags (comma-separated)"
            className="flex-1 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
            disabled={isUploading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {errors.tags && tags.length === 0 && (
          <p className="text-sm text-red-600">{errors.tags}</p>
        )}

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 pr-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => !isUploading && handleRemoveTag(tag)}
                  className="ml-2 hover:text-indigo-900"
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || !nameOverride.trim() || tags.length === 0 || isUploading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Uploading to Database...' : 'Upload to Database'}
      </Button>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Allowed file types: PDF, TXT, MD, DOC, DOCX</p>
        <p>Files should be less than 10 MB in size.</p>
        <p>Files are uploaded to the database and processed for vector search.</p>
      </div>
    </div>
  );
}
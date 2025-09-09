import React, { useState } from "react";
import mammoth from "mammoth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, X } from "lucide-react";
import { createResource } from "../models/resourceModel";

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
  const [file, setFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [nameOverride, setNameOverride] = useState<string>("");
  const [errors, setErrors] = useState<FileErrors>({ file: "", displayName: "", tags: "" });

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
    const isAllowed =
      allowedTypes.includes(f.type) || allowedExtensions.includes(fileExt);

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

  const readFileContent = async (f: File): Promise<FileContent> => {
    if (!f) return { content: "", rawData: null, fileType: "unknown" };

    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();

    if (f.type.startsWith("text/") || f.type === "text/markdown" || ext === ".md") {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({ content: reader.result as string, rawData: null, fileType: "text/markdown" });
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
        return {
          content: result.value || "",
          rawData: await readAsDataURL(f),
          fileType:
            f.type ||
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
      } catch (err) {
        console.error("Error extracting Word text:", err);
        return {
          content: "",
          rawData: await readAsDataURL(f),
          fileType:
            f.type ||
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
      }
    }

    return {
      content: "",
      rawData: await readAsDataURL(f),
      fileType: f.type || "application/pdf",
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

    const { content, rawData, fileType } = await readFileContent(file!);

    const resource = createResource({
      name: nameOverride,
      content: content || "",
      tags,
      fileType,
      rawData,
    });

    const existing = JSON.parse(sessionStorage.getItem("resources") || "[]");
    const updated = [...existing, resource];
    sessionStorage.setItem("resources", JSON.stringify(updated));

    setFile(null);
    setTags([]);
    setTagsInput("");
    setNameOverride("");
    setErrors({ file: "", displayName: "", tags: "" });

    const input = document.getElementById("file-input") as HTMLInputElement;
    if (input) input.value = "";

    window.dispatchEvent(new Event("storage"));

    if (typeof onSuccess === "function") {
      onSuccess();
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
        />

        <div
          onClick={() => document.getElementById("file-input")?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors duration-200"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <div className="text-sm text-gray-600">
              {file ? (
                <span className="font-medium text-indigo-600">Selected: {file.name}</span>
              ) : (
                <span>Click to select a file or drag and drop</span>
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
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
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
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:text-indigo-900"
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
        disabled={!file || !nameOverride.trim() || tags.length === 0}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload to Session
      </Button>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Allowed file types: PDF, TXT, MD, DOC, DOCX</p>
        <p>Files should be less than 10 MB in size.</p>
        <p>Files are stored in session storage and will be cleared when you close the browser.</p>
      </div>
    </div>
  );
}

import React, { useState, useRef } from "react";
import {
  Upload,
  Link2,
  X,
  File,
  Image,
  Video,
  FileText,
  CheckCircle2,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { verifyImageUrl } from "utils";
import { Spinner } from "@/components/ui/spinner";

type UploadMode = "file" | "url";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export default function FileUploadInput() {
  const [mode, setMode] = useState<UploadMode>("file");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [url, setUrl] = useState("");
  const [urlSubmitted, setUrlSubmitted] = useState(false);

  const [urlLoading, setUrlLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const uploaded: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
    };

    const allowedExtensions = [
      // for the drag and drop
      "jpg",
      "jpeg",
      "png",
      "webp",
    ];
    const maxFileSize = 2 * 1024 * 1024; // 2MB file limit

    const fileExtension = uploaded.name.toLowerCase().split(".").pop();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      reset();
      throw toast.error(
        `Invalid file format. Allowed formats: ${allowedExtensions.join(", ")}`,
      );
    }

    if (file.size > maxFileSize) {
      reset();
      throw toast.error("This file is too large. Max size is 2MB");
    }

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile({ ...uploaded, preview: reader.result as string });

        // 🔑 Sync file input for form submission
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        }

        setUrl("");
        setUrlSubmitted(false);
        if (urlRef.current) urlRef.current.value = "";
      };
      reader.readAsDataURL(file);
    }
    // else {
    //   setUploadedFile(uploaded);
    //   setUrl("");
    //   setUrlSubmitted(false);
    // }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUrlSubmit = async () => {
    if (url.trim()) {
      // Clear file input if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadedFile(null);
      setUrlLoading(true);

      try {
        const verifiedUrl = await verifyImageUrl(url);
        setUrl(verifiedUrl); //Pass only verified URL to formData
        if (urlRef.current) urlRef.current.value = verifiedUrl; // attach verified URL to hidden input
        setUrlSubmitted(true);
        setUrlLoading(false);
      } catch (err) {
        reset();
        toast.error("URL not attached. Please enter a valid image URL.");
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (type.startsWith("video/")) return <Video className="w-5 h-5" />;
    if (type.includes("pdf")) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const reset = () => {
    setUploadedFile(null);
    setUrl("");
    setUrlSubmitted(false);
    setUrlLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (urlRef.current) urlRef.current.value = "";
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          type="button"
          onClick={() => setMode("file")}
          disabled={mode === "url" && urlSubmitted}
          className={`flex-1 px-4 py-1 rounded-md text-sm font-medium transition-all  ${
            mode === "file"
              ? "bg-background text-foreground shadow-sm hover:bg-background dark:hover:bg-background"
              : "text-muted-foreground hover:text-foreground "
          }`}
        >
          <Upload />
          Upload File
        </Button>
        <Button
          variant={"ghost"}
          type="button"
          size={"icon-sm"}
          disabled={mode === "file" && !!uploadedFile}
          onClick={() => setMode("url")}
          className={`flex-1 px-4 py-1 rounded-md text-sm font-medium transition-all ${
            mode === "url"
              ? "bg-background text-foreground shadow-sm hover:bg-background dark:hover:bg-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 />
          From URL
        </Button>
      </div>

      <input
        ref={fileInputRef}
        id="pfp"
        type="file"
        name="pfp"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* File Upload Mode */}
      {mode === "file" && !uploadedFile && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload
                className={`w-8 h-8 transition-transform ${isDragging ? "scale-110" : ""}`}
              />
            </div>

            <div>
              <p className="text-lg font-medium mb-1">
                {isDragging
                  ? "Drop your file here"
                  : "Drag and drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse from your device
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              {/* Supports: Images, Videos, PDFs, Documents */}
            </div>
          </div>
        </div>
      )}

      {/* Uploaded File Preview */}
      {mode === "file" && uploadedFile && (
        <div className="border border-border hover:border-input rounded-lg p-3 bg-muted/30">
          <div className="flex items-start gap-4">
            {uploadedFile.preview ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={uploadedFile.preview}
                  alt={uploadedFile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                {getFileIcon(uploadedFile.type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant={"secondary"}
                  onClick={reset}
                  type="button"
                  className="hover:bg-input transition-colors"
                >
                  <X />
                </Button>
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm ">
                <CheckCircle2 className="w-4 h-4" />
                <span>File uploaded successfully</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* This hidden input is what will actually hold the verified url */}
      <input ref={urlRef} type="hidden" name="url" id="verified_url" />

      {/* URL Input Mode */}
      {mode === "url" && !urlSubmitted && (
        <div className="space-y-4">
          <InputGroup>
            <InputGroupInput
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              placeholder="https://example.com/file.jpeg"
            />
            <InputGroupAddon>
              <Link />
            </InputGroupAddon>
          </InputGroup>

          <Button
            onClick={handleUrlSubmit}
            disabled={urlLoading || !url.trim()}
            className="w-full"
          >
            {urlLoading && <Spinner />}
            Attach URL
          </Button>

          {/* <p className="text-xs text-muted-foreground text-center">
            Enter a direct link to the file you want to attach
          </p> */}
        </div>
      )}

      {/* URL Submitted */}
      {mode === "url" && urlSubmitted && (
        <div className="border border-border hover:border-input rounded-lg p-4 bg-muted/30">
          <div className="flex items-start gap-4">
            {url ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={url}
                  alt="URL image preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Link2 className="w-6 h-6" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium mb-1">URL Attached</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {url}
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant={"secondary"}
                  onClick={reset}
                  className="hover:bg-input transition-colors"
                >
                  <X />
                </Button>
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>URL attached successfully</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

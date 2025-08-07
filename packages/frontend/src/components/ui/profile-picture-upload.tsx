"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePictureUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function ProfilePictureUpload({
  value,
  onChange,
  className,
}: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type - be more specific about allowed image types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB before compression - reduced from 10MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Additional security: check file extension matches MIME type
    const extension = file.name.toLowerCase().split(".").pop();
    const validExtensions = ["jpg", "jpeg", "png", "webp"];
    if (!extension || !validExtensions.includes(extension)) {
      alert("Invalid file extension. Please use .jpg, .png, or .webp files");
      return;
    }

    // Compress the image before converting to base64
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 800x800)
      const maxSize = 800;
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

      // Security validation: ensure the result is a valid data URL for an image
      if (!compressedDataUrl.startsWith("data:image/jpeg;base64,")) {
        alert("Error processing image. Please try a different file.");
        return;
      }

      // Additional check: ensure base64 data is reasonable length (max ~2MB after compression)
      if (compressedDataUrl.length > 2 * 1024 * 1024 * 1.4) {
        // base64 is ~1.4x larger than binary
        alert("Processed image is too large. Please try a smaller image.");
        return;
      }

      setPreview(compressedDataUrl);
      onChange(compressedDataUrl);
    };

    img.src = URL.createObjectURL(file);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-center">
        <div
          className={cn(
            "relative w-48 h-48 rounded-full border-2 border-dashed transition-colors cursor-pointer",
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : preview
              ? "border-gray-300"
              : "border-gray-300 hover:border-gray-400"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Profile preview"
                className="w-full h-full rounded-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <Camera className="w-12 h-12 mb-2" />
              <p className="text-sm text-center">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Photo
        </Button>
        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}

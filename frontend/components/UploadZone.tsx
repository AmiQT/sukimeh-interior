"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image, FileText, X } from "lucide-react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  previewUrl: string | null;
  onClear: () => void;
}

export default function UploadZone({
  onFileSelected,
  previewUrl,
  onClear,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  if (previewUrl) {
    return (
      <div className="relative w-full max-w-lg mx-auto">
        <div className="relative rounded-card overflow-hidden shadow-card border-2 border-navy-200 bg-white">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-64 object-contain bg-gray-50"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
          <div className="p-3 text-center text-sm text-navy-400 font-medium">
            Floor plan uploaded successfully
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full max-w-lg mx-auto border-2 border-dashed rounded-card p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "border-accent bg-accent-50 scale-[1.02]"
          : "border-navy-200 bg-white hover:border-navy-400 hover:shadow-card"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragActive ? "bg-accent-100" : "bg-navy-50"
          }`}
        >
          <Upload
            className={`w-7 h-7 ${
              isDragActive ? "text-accent" : "text-navy-400"
            }`}
          />
        </div>
        <div>
          <p className="text-lg font-semibold text-navy-500 mb-1">
            {isDragActive
              ? "Drop your file here"
              : "Drag & drop your floor plan"}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse • Supports JPG, PNG, PDF
          </p>
        </div>
        <div className="flex gap-6 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Image className="w-3.5 h-3.5" /> Images
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> PDF
          </span>
        </div>
      </div>
    </div>
  );
}

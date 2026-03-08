import { UploadCloud, ImagePlus } from "lucide-react"
import { useState } from "react"

interface ImageUploaderProps {
  onImageUpload: (file: File) => void
  hasImage?: boolean
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]

function isValidImageFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type)
}

export function ImageUploader({ onImageUpload, hasImage = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)

  const processFile = (file: File) => {
    if (!isValidImageFile(file)) {
      setDragError("Use PNG, JPG, WebP or GIF")
      return
    }
    setDragError(null)
    onImageUpload(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="w-full">
      <label
        htmlFor="picture-upload"
        className={`
          flex flex-col items-center justify-center w-full rounded-2xl cursor-pointer
          border-2 border-dashed transition-all duration-200
          ${hasImage ? "h-28 py-6" : "h-56 py-10"}
          ${isDragging
            ? "border-primary bg-primary-muted"
            : "border-border bg-surface hover:border-primary/50 hover:bg-primary-muted/50"}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="picture-upload"
          type="file"
          className="sr-only"
          accept={ACCEPTED_TYPES.join(", ")}
          onChange={handleFileChange}
          aria-label="Upload image"
        />
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
              ${isDragging ? "bg-primary text-primary-foreground" : "bg-primary-muted text-primary"}
            `}
          >
            {hasImage ? (
              <ImagePlus className="w-7 h-7" aria-hidden />
            ) : (
              <UploadCloud className="w-7 h-7" aria-hidden />
            )}
          </div>
          <div>
            <p className="font-semibold text-text">
              {hasImage ? "Replace image" : "Drop image here"}
            </p>
            <p className="text-sm text-text-muted mt-0.5">
              {hasImage ? "or click to upload another" : "or click to browse"}
            </p>
          </div>
          <p className="text-xs text-text-muted">
            PNG, JPG, WebP, GIF
          </p>
          {dragError && (
            <p className="text-sm font-medium text-destructive">{dragError}</p>
          )}
        </div>
      </label>
    </div>
  )
}

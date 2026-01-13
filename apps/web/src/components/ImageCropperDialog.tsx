"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { OrbisFormDialog } from "@/components/OrbisDialog"
import { ImageCropper, ImageCropperRef } from "@/components/ImageCropper"
import { Icon } from "@iconify/react"
import { toast } from "sonner"

interface ImageCropperDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: File | null
  aspectRatio: number // 1 for icon (1:1), 3 for banner (3:1)
  type: "image" | "banner"
  onComplete: (blob: Blob) => Promise<void>
}

export function ImageCropperDialog({
  open,
  onOpenChange,
  file,
  aspectRatio,
  type,
  onComplete,
}: ImageCropperDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const cropperRef = useRef<ImageCropperRef>(null)

  // Load file to data URL
  useEffect(() => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please upload an image.")
      onOpenChange(false)
      return
    }

    // Validate file size
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${type === "image" ? "5MB" : "10MB"}`)
      onOpenChange(false)
      return
    }

    // Check if image is very large
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth > 4096 || img.naturalHeight > 4096) {
        toast.warning("Image is very large. Cropping may be slow.")
      }
    }

    // Load image
    const reader = new FileReader()
    reader.onerror = () => {
      toast.error("Failed to read file")
      onOpenChange(false)
    }
    reader.onload = (e) => {
      const url = e.target?.result as string
      setImageUrl(url)
      // Set image src to trigger size check
      img.src = url
    }
    reader.readAsDataURL(file)

    // Cleanup
    return () => {
      if (imageUrl) {
        // Clean up object URL if it was created
        try {
          URL.revokeObjectURL(imageUrl)
        } catch (e) {
          // Ignore error if it wasn't an object URL
        }
      }
    }
  }, [file, type, onOpenChange])

  const handleCrop = async () => {
    if (!cropperRef.current) return

    setLoading(true)
    try {
      const blob = await cropperRef.current.getCroppedImage()
      await onComplete(blob)
      onOpenChange(false)
    } catch (error) {
      console.error("Crop error:", error)
      toast.error("Failed to crop image")
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrbisFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Crop ${type === "image" ? "Avatar" : "Banner"}`}
      description={`Adjust the ${aspectRatio === 1 ? "square" : "banner"} crop area`}
      size="xl"
      onSubmit={(e) => {
        e.preventDefault()
        handleCrop()
      }}
      submitText="Apply Crop"
      submitLoading={loading}
      onCancel={() => onOpenChange(false)}
    >
      {imageUrl ? (
        <ImageCropper
          ref={cropperRef}
          imageUrl={imageUrl}
          aspectRatio={aspectRatio}
          outputFormat="image/jpeg"
          outputQuality={0.92}
        />
      ) : (
        <div className="flex items-center justify-center py-12">
          <Icon ssr={true} icon="mdi:loading"
            className="animate-spin text-primary"
            width="40"
            height="40"
          />
        </div>
      )}
    </OrbisFormDialog>
  )
}

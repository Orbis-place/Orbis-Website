"use client"

import * as React from "react"
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface ImageCropperProps {
  imageUrl: string
  aspectRatio: number // 1 for icon (1:1), 3 for banner (3:1)
  outputFormat?: "image/jpeg" | "image/png"
  outputQuality?: number // 0-1, default: 0.92
}

export interface ImageCropperRef {
  getCroppedImage: () => Promise<Blob>
}

export const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(
  ({ imageUrl, aspectRatio, outputFormat = "image/jpeg", outputQuality = 0.92 }, ref) => {
    // Image & Canvas state
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    // Transform state
    const [zoom, setZoom] = useState(1)
    const [minZoom, setMinZoom] = useState(1)
    const [maxZoom, setMaxZoom] = useState(3)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    // Interaction state
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Refs
    const imageRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Calculate export size based on aspect ratio
    const calculateExportSize = (ratio: number) => {
      if (ratio === 1) return { width: 512, height: 512 }
      return { width: 1500, height: 500 }
    }

    // Center image helper
    const centerImage = (
      currentZoom: number,
      imgWidth: number,
      imgHeight: number,
      cropW: number,
      cropH: number
    ) => {
      const scaledWidth = imgWidth * currentZoom
      const scaledHeight = imgHeight * currentZoom

      setPosition({
        x: (cropW - scaledWidth) / 2,
        y: (cropH - scaledHeight) / 2,
      })
    }

    // Constrain position to prevent showing empty space
    const constrainPosition = (x: number, y: number, currentZoom: number) => {
      if (!imageRef.current) return { x, y }

      const img = imageRef.current
      const scaledWidth = img.naturalWidth * currentZoom
      const scaledHeight = img.naturalHeight * currentZoom
      const { width: cropW, height: cropH } = canvasSize

      // Calculate bounds
      const minX = Math.min(0, cropW - scaledWidth)
      const maxX = Math.max(0, cropW - scaledWidth)
      const minY = Math.min(0, cropH - scaledHeight)
      const maxY = Math.max(0, cropH - scaledHeight)

      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      }
    }

    // Handle image load and calculate initial zoom
    useEffect(() => {
      if (!imageRef.current || !containerRef.current) return

      const img = imageRef.current
      const container = containerRef.current

      const handleLoad = () => {
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight

        // Calculate crop area dimensions based on aspect ratio
        const cropWidth = Math.min(containerWidth * 0.9, 600)
        const cropHeight = cropWidth / aspectRatio

        setCanvasSize({ width: cropWidth, height: cropHeight })
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })

        // Calculate initial zoom to fill width
        const zoomToFillWidth = cropWidth / img.naturalWidth

        // Calculate min zoom (show full image height if taller)
        const zoomToFillHeight = cropHeight / img.naturalHeight
        const calculatedMinZoom = Math.min(zoomToFillWidth, zoomToFillHeight)

        // Set zoom values
        setMinZoom(calculatedMinZoom)
        setZoom(zoomToFillWidth) // Start at width-filled
        setMaxZoom(zoomToFillWidth + 2) // Allow 2x more zoom

        // Center image initially
        centerImage(zoomToFillWidth, img.naturalWidth, img.naturalHeight, cropWidth, cropHeight)
      }

      if (img.complete) {
        handleLoad()
      } else {
        img.addEventListener("load", handleLoad)
        return () => img.removeEventListener("load", handleLoad)
      }
    }, [imageUrl, aspectRatio])

    // Render canvas preview
    useEffect(() => {
      if (!canvasRef.current || !imageRef.current || canvasSize.width === 0) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = imageRef.current

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Fill with dark background
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw image with current transform
      ctx.save()
      ctx.translate(position.x, position.y)
      ctx.scale(zoom, zoom)
      ctx.drawImage(img, 0, 0)
      ctx.restore()
    }, [position, zoom, canvasSize])

    // Handle pointer down (start drag)
    const handlePointerDown = (e: React.PointerEvent) => {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }

    // Handle pointer move (drag)
    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y

      // Constrain position to prevent showing empty space
      const constrainedPos = constrainPosition(newX, newY, zoom)
      setPosition(constrainedPos)
    }

    // Handle pointer up (end drag)
    const handlePointerUp = () => {
      setIsDragging(false)
    }

    // Handle zoom change
    const handleZoomChange = (value: number[]) => {
      const newZoom = value[0]
      if (!newZoom) return

      // Maintain center point during zoom
      const { width: cropW, height: cropH } = canvasSize
      const centerX = cropW / 2
      const centerY = cropH / 2

      // Calculate image point at center
      const imgX = (centerX - position.x) / zoom
      const imgY = (centerY - position.y) / zoom

      // Update position to keep same point centered
      const newX = centerX - imgX * newZoom
      const newY = centerY - imgY * newZoom

      setZoom(newZoom)
      const constrainedPos = constrainPosition(newX, newY, newZoom)
      setPosition(constrainedPos)
    }

    // Export cropped image
    const getCroppedImage = async (): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        if (!canvasRef.current || !imageRef.current) {
          reject(new Error("Canvas not ready"))
          return
        }

        const canvas = canvasRef.current
        const img = imageRef.current

        // Create high-res export canvas
        const exportCanvas = document.createElement("canvas")
        const exportSize = calculateExportSize(aspectRatio)
        exportCanvas.width = exportSize.width
        exportCanvas.height = exportSize.height

        const ctx = exportCanvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get context"))
          return
        }

        // Calculate source rectangle in original image
        const sourceX = -position.x / zoom
        const sourceY = -position.y / zoom
        const sourceWidth = canvasSize.width / zoom
        const sourceHeight = canvasSize.height / zoom

        // Draw cropped portion to export canvas
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          exportCanvas.width,
          exportCanvas.height
        )

        // Convert to blob
        exportCanvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error("Failed to create blob"))
          },
          outputFormat,
          outputQuality
        )
      })
    }

    // Expose getCroppedImage via ref
    useImperativeHandle(ref, () => ({
      getCroppedImage,
    }))

    return (
      <div ref={containerRef} className="flex flex-col gap-6 items-center w-full">
        {/* Canvas Container */}
        <div
          className="relative bg-secondary/20 rounded-lg overflow-hidden cursor-move touch-none"
          style={{
            width: canvasSize.width || "100%",
            height: canvasSize.height || "auto",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Hidden image for loading */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="hidden"
            crossOrigin="anonymous"
          />

          {/* Preview Canvas */}
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="block"
          />

          {/* Crop Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full border-2 border-primary/50 rounded-lg">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-primary/20" />
              ))}
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="w-full max-w-md space-y-2 px-4">
          <Label className="text-sm text-muted-foreground font-nunito">
            Zoom: {zoom.toFixed(2)}x
          </Label>
          <Slider
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={[zoom]}
            onValueChange={handleZoomChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-nunito">
            <span>Min: {minZoom.toFixed(2)}x</span>
            <span>Max: {maxZoom.toFixed(2)}x</span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-muted-foreground font-nunito text-center">
          Drag to reposition • Use slider to zoom
        </p>
      </div>
    )
  }
)

ImageCropper.displayName = "ImageCropper"

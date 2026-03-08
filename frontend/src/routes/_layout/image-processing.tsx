import { Activity } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"
import { ImageUploader } from "@/components/image-uploader"
import { type ProcessedImage, ResultsDisplay } from "@/components/results-display"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Preprocessing } from "@/client"

const PREPROCESSING_ENDPOINTS = [
  "resizeImageApiV1PreprocessResizePost",
  "cropImageApiV1PreprocessCropPost",
  "grayscaleImageApiV1PreprocessGrayscalePost",
  "noiseReductImageApiV1PreprocessNoiseReductionPost",
  "normalizeImageApiV1PreprocessNormalizationPost",
  "binarizeImageApiV1PreprocessBinarizationPost",
  "enhanceContrastImageApiV1PreprocessContrastPost",
]

export const Route = createFileRoute("/_layout/image-processing")({
  component: ImageProcessing,
})

type MutationVars = { endpoint: string; file: File; startTime: number }

function ImageProcessing() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])

  async function callSdk(endpoint: string, file: File) {
    switch (endpoint) {
      case "resizeImageApiV1PreprocessResizePost":
        return Preprocessing.resizeImageApiV1PreprocessResizePost({
          query: { width: 128, height: 128 },
          body: { img_in: file },
          responseType: "blob",
        })
      case "cropImageApiV1PreprocessCropPost":
        return Preprocessing.cropImageApiV1PreprocessCropPost({
          body: { img_in: file },
          responseType: "blob",
        })
      case "grayscaleImageApiV1PreprocessGrayscalePost":
        return Preprocessing.grayscaleImageApiV1PreprocessGrayscalePost({
          body: { img_in: file },
          responseType: "blob",
        })
      case "noiseReductImageApiV1PreprocessNoiseReductionPost":
        return Preprocessing.noiseReductImageApiV1PreprocessNoiseReductionPost({
          query: {
            technique: "gaussian_blur",
            kernel_size: 5,
            sigma_color: 75.0,
            sigma_space: 75.0,
          },
          body: { image: file },
          responseType: "blob",
        })
      case "normalizeImageApiV1PreprocessNormalizationPost":
        return Preprocessing.normalizeImageApiV1PreprocessNormalizationPost({
          query: { technique: "rescaling" },
          body: { img_in: file },
          responseType: "blob",
        })
      case "binarizeImageApiV1PreprocessBinarizationPost":
        return Preprocessing.binarizeImageApiV1PreprocessBinarizationPost({
          query: { technique: "binary", threshold: 127 },
          body: { image: file },
          responseType: "blob",
        })
      case "enhanceContrastImageApiV1PreprocessContrastPost":
        return Preprocessing.enhanceContrastImageApiV1PreprocessContrastPost({
          query: {
            technique: "clahe",
            clip_limit: 2.0,
            tile_grid_size: 8,
          },
          body: { image: file },
          responseType: "blob",
        })
      default:
        return Promise.reject(new Error(`Unknown endpoint: ${endpoint}`))
    }
  }

  function isBlobLike(obj: unknown): obj is { arrayBuffer: () => Promise<ArrayBuffer> } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "arrayBuffer" in obj &&
      typeof (obj as { arrayBuffer: unknown }).arrayBuffer === "function"
    )
  }

  async function ensureBlob(data: unknown): Promise<Blob> {
    if (data instanceof Blob) return data
    if (data instanceof ArrayBuffer) return new Blob([data])
    if (isBlobLike(data)) return new Blob([await data.arrayBuffer()])
    throw new Error("Cannot convert to Blob")
  }

  const mutation = useMutation({
    retry: 1,
    mutationFn: async ({ endpoint, file }: MutationVars) => {
      const res = await callSdk(endpoint, file)
      if ("isAxiosError" in res && res.isAxiosError) throw res
      const blobData = res.data ?? res
      return ensureBlob(blobData)
    },
    onSuccess: (data, { endpoint, startTime }) => {
      const url = URL.createObjectURL(data as Blob)
      setProcessedImages((prev) =>
        prev.map((img) =>
          img.name === endpoint
            ? { ...img, status: "success" as const, url, time: Date.now() - startTime }
            : img
        )
      )
    },
    onError: (error, { endpoint, startTime }) => {
      setProcessedImages((prev) =>
        prev.map((img) =>
          img.name === endpoint
            ? { ...img, status: "error" as const, error: (error as Error).message, time: Date.now() - startTime }
            : img
        )
      )
    },
  })

  const handleImageUpload = (file: File) => {
    setOriginalImage(URL.createObjectURL(file))
    const initial: ProcessedImage[] = PREPROCESSING_ENDPOINTS.map((name) => ({
      name,
      url: "",
      status: "idle",
    }))
    setProcessedImages(initial)
    PREPROCESSING_ENDPOINTS.forEach((endpoint) => {
      setProcessedImages((prev) =>
        prev.map((img) => (img.name === endpoint ? { ...img, status: "pending" as const } : img))
      )
      mutation.mutate({ endpoint, file, startTime: Date.now() })
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text">
              Pipeline Visualizer
            </h1>
            <p className="mt-2 text-text-muted text-sm sm:text-base max-w-xl">
              Upload an image to see how computer vision transforms prepare data for ML models.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-muted border border-primary/20 w-fit">
            <Activity className="w-4 h-4 text-primary" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider text-text">
              Live
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-10">
        <ImageUploader onImageUpload={handleImageUpload} hasImage={!!originalImage} />
        {originalImage && (
          <ResultsDisplay originalImage={originalImage} processedImages={processedImages} />
        )}
      </div>
    </div>
  )
}

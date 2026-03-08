import { Download, Loader2, AlertCircle, ImageOff } from "lucide-react"

export interface ProcessedImage {
  name: string
  url: string
  status: "idle" | "pending" | "success" | "error"
  time?: number
  error?: string
}

interface ResultsDisplayProps {
  originalImage: string
  processedImages: ProcessedImage[]
}

const PREPROCESSING_INFO: Record<string, { title: string; description: string }> = {
  resizeImageApiV1PreprocessResizePost: {
    title: "Resize (128×128)",
    description: "Standardizes dimensions for fixed input tensor shapes.",
  },
  cropImageApiV1PreprocessCropPost: {
    title: "Center Crop",
    description: "Focuses on the main subject, reducing irrelevant features.",
  },
  grayscaleImageApiV1PreprocessGrayscalePost: {
    title: "Grayscale",
    description: "Reduces from 3 channels to 1, speeding up training.",
  },
  noiseReductImageApiV1PreprocessNoiseReductionPost: {
    title: "Gaussian Blur",
    description: "Removes high-frequency noise and camera artifacts.",
  },
  normalizeImageApiV1PreprocessNormalizationPost: {
    title: "Normalization (0–1)",
    description: "Scales pixel intensities for stable gradients.",
  },
  binarizeImageApiV1PreprocessBinarizationPost: {
    title: "Binarization",
    description: "Converts to black/white for shapes and OCR.",
  },
  enhanceContrastImageApiV1PreprocessContrastPost: {
    title: "Contrast (CLAHE)",
    description: "Reveals hidden features in low-contrast areas.",
  },
}

export function ResultsDisplay({ originalImage, processedImages }: ResultsDisplayProps) {
  return (
    <div className="w-full space-y-12 mt-12 animate-in fade-in duration-300">
      {/* Original */}
      <section>
        <h2 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-primary" aria-hidden />
          Original Image
        </h2>
        <div className="card-ocean p-4">
          <img
            src={originalImage}
            alt="Original input"
            className="rounded-xl w-full max-h-80 object-contain mx-auto"
          />
        </div>
      </section>

      {/* Results */}
      <section>
        <h2 className="text-lg font-heading font-semibold text-text mb-6">
          Pre-Processing Results
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {processedImages.map((image) => {
            const info = PREPROCESSING_INFO[image.name] ?? {
              title: image.name,
              description: "Processing applied.",
            }
            return (
              <article
                key={image.name}
                className="card-ocean-elevated flex flex-col overflow-hidden"
                aria-busy={image.status === "pending"}
                aria-label={`${info.title} — ${image.status}`}
              >
                <div className="p-4 border-b border-border">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-heading font-semibold text-text">{info.title}</h3>
                    {image.status === "success" && image.time != null && (
                      <span className="text-xs font-mono text-text-muted bg-primary-muted px-2 py-1 rounded-md shrink-0">
                        {image.time}ms
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
                    {info.description}
                  </p>
                </div>

                <div className="p-4 flex-1 min-h-[200px] flex items-center justify-center bg-background/50">
                  {image.status === "idle" && (
                    <div className="flex flex-col items-center gap-2 text-text-muted">
                      <ImageOff className="w-10 h-10 opacity-40" aria-hidden />
                      <span className="text-sm font-medium">Waiting</span>
                    </div>
                  )}
                  {image.status === "pending" && (
                    <div className="flex flex-col items-center gap-2 text-primary">
                      <Loader2 className="w-8 h-8 animate-spin" aria-hidden />
                      <span className="text-sm font-medium">Processing…</span>
                    </div>
                  )}
                  {image.status === "error" && (
                    <div className="flex flex-col items-center gap-2 text-destructive text-center p-4">
                      <AlertCircle className="w-8 h-8 shrink-0" aria-hidden />
                      <span className="text-sm font-medium">{image.error}</span>
                    </div>
                  )}
                  {image.status === "success" && (
                    <img
                      src={image.url}
                      alt={`Result: ${info.title}`}
                      className="rounded-lg max-h-48 w-full object-contain"
                    />
                  )}
                </div>

                {image.status === "success" && (
                  <div className="p-3 border-t border-border">
                    <a
                      href={image.url}
                      download={`${info.title.replace(/\s+/g, "_").toLowerCase()}.png`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors"
                    >
                      <Download className="w-4 h-4" aria-hidden /> Download
                    </a>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

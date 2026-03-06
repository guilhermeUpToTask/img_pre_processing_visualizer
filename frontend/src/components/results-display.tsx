import { Download, Loader2, AlertCircle, Info } from "lucide-react";

/**
 * Represents a processed image with its metadata.
 */
export interface ProcessedImage {
  /** The name of the preprocessing operation. */
  name: string;
  /** The URL of the processed image. */
  url: string;
  /** The status of the processing. */
  status: "idle" | "pending" | "success" | "error";
  /** The time taken for the processing in milliseconds. */
  time?: number;
  /** The error message if the processing failed. */
  error?: string;
}

interface ResultsDisplayProps {
  /** The URL of the original image. */
  originalImage: string;
  /** An array of processed images. */
  processedImages: ProcessedImage[];
}

const PREPROCESSING_INFO: Record<string, { title: string; description: string }> = {
  "resizeImageApiV1PreprocessResizePost": {
    title: "Resize (128x128)",
    description: "Standardizes dimensions. Neural networks require fixed input tensor shapes to compute matrix multiplications reliably."
  },
  "cropImageApiV1PreprocessCropPost": {
    title: "Center Crop",
    description: "Removes background noise and focuses on the main subject, reducing irrelevant feature processing during model inference."
  },
  "grayscaleImageApiV1PreprocessGrayscalePost": {
    title: "Grayscale",
    description: "Reduces data dimensionality from 3 channels (RGB) to 1. Useful when color is not a predictive feature, speeding up training drastically."
  },
  "noiseReductImageApiV1PreprocessNoiseReductionPost": {
    title: "Gaussian Blur",
    description: "Applies a low-pass filter to remove high-frequency noise. Prevents models from learning random camera artifacts as important features."
  },
  "normalizeImageApiV1PreprocessNormalizationPost": {
    title: "Normalization (0-1)",
    description: "Scales pixel intensities to fall between 0 and 1. This prevents exploding/vanishing gradients and helps optimizers converge faster."
  },
  "binarizeImageApiV1PreprocessBinarizationPost": {
    title: "Binarization",
    description: "Converts pixels to pure black or white using a threshold. Excellent for extracting shapes, contours, and textual features (OCR)."
  },
  "enhanceContrastImageApiV1PreprocessContrastPost": {
    title: "Contrast Enhancement (CLAHE)",
    description: "Localizes histogram equalization. Reveals hidden features in under-exposed or low-contrast areas without washing out bright regions."
  }
};

/**
 * A component for displaying the original and processed images.
 * @param {ResultsDisplayProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export function ResultsDisplay({ originalImage, processedImages }: ResultsDisplayProps) {
  return (
    <div className="w-full flex flex-col gap-10 mt-12 animate-in fade-in duration-1000">
      
      {/* Original Image Section */}
      <section className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-heading font-bold mb-4 text-center">Original Image Input</h2>
        <div className="glass p-4 rounded-2xl w-full max-w-xl mx-auto flex justify-center shadow-lg shadow-black/20">
          <img src={originalImage} alt="Original" className="rounded-xl w-full object-contain max-h-[400px] border border-white/5" />
        </div>
      </section>

      {/* Pre-processed Images Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-heading font-bold">ML Pre-Processing Pipelines</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {processedImages.map((image) => {
            const info = PREPROCESSING_INFO[image.name] || { title: image.name, description: "Processing technique applied to image." };
            
            return (
              <div key={image.name} className="glass-card flex flex-col overflow-hidden group">
                {/* Header info */}
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <h3 className="font-heading font-bold text-lg text-foreground flex justify-between items-center">
                    {info.title}
                    {image.status === "success" && <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded-md">{image.time}ms</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 min-h-[60px]">
                    {info.description}
                  </p>
                </div>

                {/* Content / Image area */}
                <div className="p-4 flex-grow flex items-center justify-center bg-black/20 relative min-h-[250px]">
                  {image.status === "pending" && (
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-sm font-medium animate-pulse">Computing tensor...</span>
                    </div>
                  )}

                  {image.status === "error" && (
                    <div className="flex flex-col items-center gap-3 text-destructive p-4 text-center">
                      <AlertCircle className="w-8 h-8" />
                      <span className="text-sm font-medium">{image.error}</span>
                    </div>
                  )}

                  {image.status === "success" && (
                    <img 
                      src={image.url} 
                      alt={info.title} 
                      className="rounded-lg max-h-[250px] object-contain shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]" 
                    />
                  )}
                </div>

                {/* Footer Action */}
                {image.status === "success" && (
                  <div className="p-3 bg-white/5 flex justify-end">
                    <a 
                      href={image.url} 
                      download={`${info.title.replace(/\s+/g, "_").toLowerCase()}.png`} 
                      className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors bg-white/5 hover:bg-primary/20 px-3 py-1.5 rounded-lg"
                    >
                      <Download className="w-4 h-4" /> Export Tensor
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

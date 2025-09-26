import { createFileRoute } from "@tanstack/react-router";
import { ImageUploader } from "@/components/image-uploader";
import { type ProcessedImage, ResultsDisplay } from "@/components/results-display";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Preprocessing } from "@/client";

const preprocessingEndpoints = [
    "resizeImageApiV1PreprocessResizePost",
    "cropImageApiV1PreprocessCropPost",
    "grayscaleImageApiV1PreprocessGrayscalePost",
    "noiseReductImageApiV1PreprocessNoiseReductionPost",
    "normalizeImageApiV1PreprocessNormalizationPost",
    "binarizeImageApiV1PreprocessBinarizationPost",
    "enhanceContrastImageApiV1PreprocessContrastPost",
];

export const Route = createFileRoute("/_layout/image-processing")({
  component: ImageProcessing,
});

/**
 * A component that allows users to upload an image and see the results of various preprocessing operations.
 * @returns {JSX.Element} - The rendered component.
 */
function ImageProcessing() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

  const mutation = useMutation({
    retry: 1,
    mutationFn: ({ endpoint, file }: { endpoint: string; file: File; }) => {
    
        switch (endpoint) {
            case 'resizeImageApiV1PreprocessResizePost':
                return Preprocessing.resizeImageApiV1PreprocessResizePost({
                    body: {
                        params: { width: 128, height: 128 },
                        img_in: file,
                    },
                });
            case 'cropImageApiV1PreprocessCropPost':
                return Preprocessing.cropImageApiV1PreprocessCropPost({
                    body: {
                        img_in: file,
                    },
                });
            case 'grayscaleImageApiV1PreprocessGrayscalePost':
                return Preprocessing.grayscaleImageApiV1PreprocessGrayscalePost({
                    body: {
                        img_in: file,
                    },
                });
            case 'noiseReductImageApiV1PreprocessNoiseReductionPost':
                return Preprocessing.noiseReductImageApiV1PreprocessNoiseReductionPost({
                    body: {
                        params: { technique: 'gaussian_blur' },
                        image: file,
                    },
                });
            case 'normalizeImageApiV1PreprocessNormalizationPost':
                return Preprocessing.normalizeImageApiV1PreprocessNormalizationPost({
                    body: {
                        params: { technique: 'rescaling' },
                        img_in: file,
                    },
                });
            case 'binarizeImageApiV1PreprocessBinarizationPost':
                return Preprocessing.binarizeImageApiV1PreprocessBinarizationPost({
                    body: {
                        params: { technique: 'binary' },
                        image: file,
                    },
                });
            case 'enhanceContrastImageApiV1PreprocessContrastPost':
                return Preprocessing.enhanceContrastImageApiV1PreprocessContrastPost({
                    body: {
                        params: { technique: 'clahe' },
                        image: file,
                    },
                });
            default:
                return Promise.reject(new Error(`Unknown endpoint: ${endpoint}`));
        }
    },
    onSuccess: (data, variables: { endpoint: string; file: File; startTime: number }) => {
        const url = URL.createObjectURL(data as unknown as Blob);
        setProcessedImages((prev) =>
          prev.map((img) =>
            img.name === variables.endpoint
              ? { ...img, status: "success", url, time: Date.now() - variables.startTime }
              : img
          )
        );
    },
    onError: (error, variables: { endpoint: string; file: File; startTime: number }) => {
        setProcessedImages((prev) =>
          prev.map((img) =>
            img.name === variables.endpoint
              ? { ...img, status: "error", error: error.message, time: Date.now() - variables.startTime }
              : img
          )
        );
    },
  });

  /**
   * Handles the upload of an image file.
   * @param file - The uploaded image file.
   */
  const handleImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setOriginalImage(imageUrl);

    const initialImages: ProcessedImage[] = preprocessingEndpoints.map((endpoint) => ({
      name: endpoint,
      url: "",
      status: "idle",
    }));
    setProcessedImages(initialImages);

    preprocessingEndpoints.forEach((endpoint) => {
      const startTime = Date.now();
      setProcessedImages((prev) =>
        prev.map((img) =>
          img.name === endpoint ? { ...img, status: "pending" } : img
        )
      );
      mutation.mutate({ endpoint, file, startTime });
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Preprocessing</h1>
      <ImageUploader onImageUpload={handleImageUpload} />
      {originalImage && (
        <ResultsDisplay
          originalImage={originalImage}
          processedImages={processedImages}
        />
      )}
    </div>
  );
}

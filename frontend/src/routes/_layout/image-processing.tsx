import { createFileRoute } from "@tanstack/react-router";
import { ImageUploader } from "@/components/image-uploader";
import { type ProcessedImage, ResultsDisplay } from "@/components/results-display";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Preprocessing } from "@/client";


export const Route = createFileRoute("/_layout/image-processing")({
  component: ImageProcessing,
});

const preprocessingEndpoints: (keyof typeof Preprocessing)[] = [
  "resizeImageApiV1PreprocessResizePost",
  "cropImageApiV1PreprocessCropPost",
  "grayscaleImageApiV1PreprocessGrayscalePost",
  "noiseReductImageApiV1PreprocessNoiseReductionPost",
  "normalizeImageApiV1PreprocessNormalizationPost",
  "binarizeImageApiV1PreprocessBinarizationPost",
  "enhanceContrastImageApiV1PreprocessContrastPost",
];

/**
 * A component that allows users to upload an image and see the results of various preprocessing operations.
 * @returns {JSX.Element} - The rendered component.
 */
function ImageProcessing() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

  const mutation = useMutation({
    retry: 1,
    mutationFn: ({ endpoint, file }: { endpoint: keyof typeof Preprocessing; file: File }) => {
        const formData = new FormData();
        formData.append("img_in", file);
        return (Preprocessing[endpoint] as (options: { body: FormData }) => Promise<unknown>)({ body: formData });
    },
    onSuccess: (data, variables) => {
        const url = URL.createObjectURL(data as Blob);
        setProcessedImages((prev) =>
          prev.map((img) =>
            img.name === variables.endpoint
              ? { ...img, status: "success", url, time: Date.now() - (img.time ?? 0) }
              : img
          )
        );
    },
    onError: (error, variables) => {
        setProcessedImages((prev) =>
          prev.map((img) =>
            img.name === variables.endpoint
              ? { ...img, status: "error", error: error.message, time: Date.now() - (img.time ?? 0) }
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
      status: "pending",
      time: Date.now(),
    }));
    setProcessedImages(initialImages);

    preprocessingEndpoints.forEach((endpoint) => {
      mutation.mutate({ endpoint, file });
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

import { createFileRoute } from "@tanstack/react-router";
import { ImageUploader } from "@/components/image-uploader";
import {
    type ProcessedImage,
    ResultsDisplay,
} from "@/components/results-display";
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

type MutationVars = {
    endpoint: string;
    file: File;
    startTime: number;
};

/**
 * A component that allows users to upload an image and see the results of various preprocessing operations.
 * @returns {JSX.Element} - The rendered component.
 */
function ImageProcessing() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImages, setProcessedImages] = useState<ProcessedImage[]>(
        []
    );

    async function callSdk(endpoint: string, file: File) {
        switch (endpoint) {
            case "resizeImageApiV1PreprocessResizePost":
                return Preprocessing.resizeImageApiV1PreprocessResizePost({
                    query: { width: 128, height: 128 },
                    body: { img_in: file },
                    responseType: "blob",
                });
            case "cropImageApiV1PreprocessCropPost":
                return Preprocessing.cropImageApiV1PreprocessCropPost({
                    body: { img_in: file },
                    responseType: "blob",
                });
            case "grayscaleImageApiV1PreprocessGrayscalePost":
                return Preprocessing.grayscaleImageApiV1PreprocessGrayscalePost(
                    {
                        body: { img_in: file },
                        responseType: "blob",
                    }
                );
            case "noiseReductImageApiV1PreprocessNoiseReductionPost":
                return Preprocessing.noiseReductImageApiV1PreprocessNoiseReductionPost(
                    {
                        query: {
                            technique: "gaussian_blur",
                            kernel_size: 5,
                            sigma_color: 75.0,
                            sigma_space: 75.0,
                        },
                        //TODO: Change endpoint later to have img_in aswell
                        body: { image: file },
                        responseType: "blob",
                    }
                );

            case "normalizeImageApiV1PreprocessNormalizationPost":
                return Preprocessing.normalizeImageApiV1PreprocessNormalizationPost(
                    {
                        query: { technique: "rescaling" },
                        body: { img_in: file },
                        responseType: "blob",
                    }
                );

            case "binarizeImageApiV1PreprocessBinarizationPost":
                return Preprocessing.binarizeImageApiV1PreprocessBinarizationPost(
                    {
                        query: { technique: "binary", threshold: 127 },
                        //TODO: Change endpoint later to have img_in aswell
                        body: { image: file },
                        responseType: "blob",
                    }
                );

            case "enhanceContrastImageApiV1PreprocessContrastPost":
                return Preprocessing.enhanceContrastImageApiV1PreprocessContrastPost(
                    {
                        query: {
                            technique: "clahe",
                            clip_limit: 2.0,
                            tile_grid_size: 8,
                        },
                        body: { image: file },
                        responseType: "blob",
                    }
                );

            default:
                return Promise.reject(
                    new Error(`Unknown endpoint: ${endpoint}`)
                );
        }
    }
    /**
     * Type guard to check if a value is "Blob-like".
     *
     * A Blob-like object is any object that has an `arrayBuffer` method
     * returning a Promise of an ArrayBuffer, similar to the standard `Blob` API.
     *
     * This is useful when you receive a value of unknown type (for example, from
     * a network request or SDK call) and want to safely convert it to a Blob.
     *
     * @param obj - The value to check.
     * @returns `true` if the object is Blob-like (has an `arrayBuffer` method), `false` otherwise.
     */
    function isBlobLike(
        obj: unknown
    ): obj is { arrayBuffer: () => Promise<ArrayBuffer> } {
        return (
            typeof obj === "object" &&
            obj !== null &&
            "arrayBuffer" in obj &&
            typeof obj.arrayBuffer === "function"
        );
    }
    /**
     * Ensures that a given value is converted to a `Blob`.
     *
     * This function takes an unknown input and attempts to normalize it into a `Blob`.
     * It supports:
     *  - `Blob` instances (returned as-is)
     *  - `ArrayBuffer` instances (wrapped in a `Blob`)
     *  - Blob-like objects (objects with an `arrayBuffer()` method)
     *
     * If the input cannot be converted to a `Blob`, an error is thrown.
     *
     * @param data - The value to convert to a `Blob`.
     * @returns A Promise that resolves to a `Blob`.
     * @throws Error if the input type cannot be converted to a `Blob`.
     */
    async function ensureBlob(data: unknown): Promise<Blob> {
        if (data instanceof Blob) return data;
        if (data instanceof ArrayBuffer) return new Blob([data]);
        if (isBlobLike(data)) {
            const ab = await data.arrayBuffer();
            return new Blob([ab]);
        }

        throw new Error("Cannot convert unknown type to Blob");
    }

    const mutation = useMutation({
        retry: 1,
        mutationFn: async ({ endpoint, file }: MutationVars) => {
            const res = await callSdk(endpoint, file);
            if ("isAxiosError" in res && res.isAxiosError) {
                throw res;
            }
            // Narrow the type to AxiosResponse
            // Some SDK calls may return Blob directly
            const blobData = res.data ?? res;

            return await ensureBlob(blobData);
        },
        onSuccess: (
            data,
            variables: { endpoint: string; file: File; startTime: number }
        ) => {
            const url = URL.createObjectURL(data as unknown as Blob);
            setProcessedImages((prev) =>
                prev.map((img) =>
                    img.name === variables.endpoint
                        ? {
                              ...img,
                              status: "success",
                              url,
                              time: Date.now() - variables.startTime,
                          }
                        : img
                )
            );
        },
        onError: (
            error,
            variables: { endpoint: string; file: File; startTime: number }
        ) => {
            setProcessedImages((prev) =>
                prev.map((img) =>
                    img.name === variables.endpoint
                        ? {
                              ...img,
                              status: "error",
                              error: error.message,
                              time: Date.now() - variables.startTime,
                          }
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

        const initialImages: ProcessedImage[] = preprocessingEndpoints.map(
            (endpoint) => ({
                name: endpoint,
                url: "",
                status: "idle",
            })
        );
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

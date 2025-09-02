import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProcessedImage {
  name: string;
  url: string;
  status: "idle" | "pending" | "success" | "error";
  time?: number;
  error?: string;
}

interface ResultsDisplayProps {
  originalImage: string;
  processedImages: ProcessedImage[];
}

export function ResultsDisplay({ originalImage, processedImages }: ResultsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Original</CardTitle>
        </CardHeader>
        <CardContent>
          <img src={originalImage} alt="Original" className="rounded-md" />
        </CardContent>
      </Card>
      {processedImages.map((image) => (
        <Card key={image.name}>
          <CardHeader>
            <CardTitle className="capitalize">{image.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {image.status === "pending" && <p>Processing...</p>}
            {image.status === "error" && <p className="text-red-500">Error: {image.error}</p>}
            {image.status === "success" && (
              <>
                <img src={image.url} alt={image.name} className="rounded-md" />
                <p className="text-sm text-gray-500 mt-2">Time: {image.time}ms</p>
                <a href={image.url} download={`${image.name}.png`} className="text-blue-500 hover:underline mt-2 block">Download</a>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

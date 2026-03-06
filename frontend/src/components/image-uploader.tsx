import { UploadCloud } from "lucide-react";

interface ImageUploaderProps {
  /**
   * A callback function that is called when an image is uploaded.
   * @param file - The uploaded image file.
   */
  onImageUpload: (file: File) => void;
}

/**
 * A component for uploading an image file.
 * @param {ImageUploaderProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label
        htmlFor="picture-upload"
        className="glass flex flex-col items-center justify-center w-full h-64 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all group overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 px-4">
          <div className="bg-primary/10 text-primary p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud className="w-10 h-10" />
          </div>
          <p className="mb-2 text-xl font-heading font-semibold text-foreground">
            <span className="font-bold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            SVG, PNG, JPG or GIF (MAX. 800x400px). The original image will be processed through multiple ML pipelines.
          </p>
        </div>
        <input
          id="picture-upload"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}

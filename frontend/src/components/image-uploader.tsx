import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}

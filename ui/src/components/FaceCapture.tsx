import { Button } from "./ui/button";
import { Camera, X, Info } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface FaceCaptureProps {
  capturedImages: string[];
  onCapture: () => void;
  onRemove: (index: number) => void;
}

export function FaceCapture({ capturedImages, onCapture, onRemove }: FaceCaptureProps) {
  const maxImages = 5;
  const canCapture = capturedImages.length < maxImages;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Face Capture</h2>
        <p className="text-gray-500">Capture multiple face images for better recognition</p>
      </div>

      {/* Camera Preview */}
      <div className="space-y-4">
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center border-2 border-dashed border-gray-300">
          {/* Camera placeholder */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Camera Preview</p>
            <p className="text-gray-400">Live feed will appear here</p>
          </div>

          {/* Overlay guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-4 border-blue-500 rounded-2xl opacity-30"></div>
          </div>
        </div>

        {/* Guidelines */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Guidelines:</strong> Look directly at camera, ensure good lighting, avoid shadows, and maintain a neutral expression.
          </AlertDescription>
        </Alert>

        {/* Capture Button and Counter */}
        <div className="space-y-3">
          <Button
            onClick={onCapture}
            disabled={!canCapture}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Camera className="mr-2 h-4 w-4" />
            Capture Face Image
          </Button>
          
          <div className="text-center">
            <span className={`${capturedImages.length >= 3 ? 'text-green-600' : 'text-gray-600'}`}>
              {capturedImages.length}/{maxImages} images captured
            </span>
            {capturedImages.length >= 3 && (
              <span className="text-green-600 ml-2">✓ Minimum met</span>
            )}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {capturedImages.length > 0 && (
          <div className="space-y-2">
            <Label className="text-gray-700">Captured Images</Label>
            <div className="grid grid-cols-5 gap-2">
              {capturedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                >
                  <img
                    src={image}
                    alt={`Captured face ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onRemove(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1">
                    {index + 1}
                  </div>
                </div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: maxImages - capturedImages.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
                >
                  <Camera className="w-6 h-6 text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`block mb-2 ${className}`}>{children}</label>;
}

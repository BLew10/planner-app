import { useState, useRef, useEffect } from "react";
import { Layout, AdPlacement } from "@prisma/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DisplayCanvasProps {
  layout: Layout & {
    adPlacements: (AdPlacement & {
      advertisement: {
        name: string;
      };
    })[];
  };
  calendarEditionId: string;
  year: number;
}

export function DisplayCanvas({ layout, calendarEditionId, year }: DisplayCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});
  const [uploadingPlacements, setUploadingPlacements] = useState<Set<string>>(new Set());
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Update container dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, placementId: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please drop an image file");
      return;
    }

    // Start upload
    setUploadingPlacements(prev => new Set(prev).add(placementId));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("placementId", placementId);

      const response = await fetch(
        `/api/calendar-editions/${calendarEditionId}/displays/${year}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await response.json();
      setUploadedImages(prev => ({
        ...prev,
        [placementId]: url,
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingPlacements(prev => {
        const next = new Set(prev);
        next.delete(placementId);
        return next;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const renderPlacement = (placement: AdPlacement & { advertisement: { name: string } }) => {
    const style = {
      left: `${placement.x}%`,
      top: `${placement.y}%`,
      width: `${placement.width}%`,
      height: `${placement.height}%`,
      backgroundColor: uploadedImages[placement.id] ? 'transparent' : 'rgba(249, 250, 251, 0.8)',
    };

    return (
      <div
        key={placement.id}
        className={`absolute border-2 ${
          selectedArea === placement.id
            ? "border-blue-500"
            : "border-gray-300"
        } rounded-lg overflow-hidden cursor-pointer transition-colors`}
        style={style}
        onClick={() => setSelectedArea(placement.id)}
        onDrop={(e) => handleDrop(e, placement.id)}
        onDragOver={handleDragOver}
      >
        {uploadingPlacements.has(placement.id) ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : uploadedImages[placement.id] ? (
          <img
            src={uploadedImages[placement.id]}
            alt={`Image for ${placement.advertisement.name}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 text-sm p-2">
            <span>Drop image here</span>
            <span className="text-xs text-center mt-1 text-gray-400">
              {placement.advertisement.name}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderCalendar = (position: "top" | "bottom") => {
    const placements = layout.adPlacements.filter(p => p.position === position);
    
    return (
      <div 
        ref={position === "top" ? canvasRef : undefined}
        className="relative w-full" 
        style={{ paddingBottom: '33.333%' }}
      >
        <div className="absolute inset-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
          {placements.map(renderPlacement)}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Calendar */}
      {renderCalendar("top")}

      {/* Bottom Calendar */}
      {renderCalendar("bottom")}
    </div>
  );
} 
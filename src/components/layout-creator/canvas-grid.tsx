import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SavedArea {
  id: string;
  adTypeId: string;
  adTypeName: string;
  slotNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  position: 'top' | 'bottom';
}

interface CanvasProps {
  width: number | string;
  height: number | string;
  savedAreas: SavedArea[];
  position: 'top' | 'bottom';
  onSelectionComplete: (selection: {
    x: number;
    y: number;
    width: number;
    height: number;
    position: 'top' | 'bottom';
  }) => void;
  onDeleteArea?: (areaId: string) => void;
}

export function Canvas({ width, height, savedAreas, position, onSelectionComplete, onDeleteArea }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  // Handle mouse down - start drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  };

  // Handle mouse move - update selection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPos({ x, y });
  };

  // Handle mouse up - complete selection
  const handleMouseUp = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    // Calculate the selection rectangle
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // Only trigger if we have a meaningful selection
    if (width > 10 && height > 10) {
      onSelectionComplete({ x, y, width, height, position });
    }
  };

  // Selection overlay styles
  const selectionStyle = isDrawing ? {
    position: 'absolute',
    left: Math.min(startPos.x, currentPos.x),
    top: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y),
    border: '2px solid #2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    pointerEvents: 'none',
  } as const : null;

  // Define colors for different ad types (using the first character of adTypeId for consistency)
  const getColorForAdType = (adTypeId: string) => {
    const colors = [
      'rgba(59, 130, 246, 0.3)', // blue
      'rgba(34, 197, 94, 0.3)',  // green
      'rgba(234, 179, 8, 0.3)',  // yellow
      'rgba(168, 85, 247, 0.3)', // purple
      'rgba(236, 72, 153, 0.3)', // pink
      'rgba(79, 70, 229, 0.3)',  // indigo
      'rgba(249, 115, 22, 0.3)', // orange
      'rgba(20, 184, 166, 0.3)',  // teal
    ];
    const index = adTypeId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative cursor-crosshair",
        "border border-gray-200 rounded-lg overflow-hidden bg-white"
      )}
      style={{ width, height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Saved Areas */}
      {savedAreas.map((area) => (
        <div
          key={area.id}
          className="group"
          style={{
            position: 'absolute',
            left: area.x,
            top: area.y,
            width: area.width,
            height: area.height,
            backgroundColor: getColorForAdType(area.adTypeId),
            border: `2px solid ${getColorForAdType(area.adTypeId).replace('0.3', '0.5')}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            color: '#1f2937',
            borderRadius: '4px',
          }}
        >
          {/* Delete Button */}
          {onDeleteArea && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteArea(area.id);
              }}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md border border-gray-200 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer
                         hover:bg-red-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          )}
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm pointer-events-none">
            {area.adTypeName} #{area.slotNumber}
          </span>
        </div>
      ))}

      {/* Selection overlay */}
      {isDrawing && selectionStyle && (
        <div style={selectionStyle} />
      )}
    </div>
  );
} 
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onCopyArea?: (areaId: string) => void;
  onMoveArea?: (areaId: string, newX: number, newY: number) => void;
  isPasteMode?: boolean;
}

export function Canvas({ 
  width, 
  height, 
  savedAreas, 
  position, 
  onSelectionComplete, 
  onDeleteArea,
  onCopyArea,
  onMoveArea,
  isPasteMode 
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [draggedArea, setDraggedArea] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle mouse down - start drawing or dragging
  const handleMouseDown = (e: React.MouseEvent, areaId?: string) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (areaId) {
      // Start dragging an existing area
      setDraggedArea(areaId);
      const area = savedAreas.find(a => a.id === areaId);
      if (area) {
        setDragOffset({
          x: x - area.x,
          y: y - area.y
        });
      }
      e.stopPropagation(); // Prevent canvas drawing
    } else if (isPasteMode) {
      // Paste at current mouse position
      onSelectionComplete({
        x: mousePos.x,
        y: mousePos.y,
        width: 0, // These will be ignored for paste operation
        height: 0,
        position
      });
    } else {
      // Start drawing a new area
      setIsDrawing(true);
      setStartPos({ x, y });
      setCurrentPos({ x, y });
    }
  };

  // Handle mouse move - update selection or dragged area
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Always update mouse position for paste mode
    setMousePos({ x, y });
    
    if (draggedArea && onMoveArea) {
      // Update dragged area position
      onMoveArea(draggedArea, 
        Math.max(0, Math.min(x - dragOffset.x, rect.width - 10)),
        Math.max(0, Math.min(y - dragOffset.y, rect.height - 10))
      );
    } else if (isDrawing) {
      // Update selection rectangle
      setCurrentPos({ x, y });
    }
  };

  // Handle mouse up - complete selection or dragging
  const handleMouseUp = () => {
    if (draggedArea) {
      setDraggedArea(null);
    } else if (isDrawing) {
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
        "relative",
        isPasteMode ? "cursor-copy" : "cursor-crosshair",
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
          className={cn(
            "group",
            draggedArea === area.id && "cursor-grabbing",
            !draggedArea && "cursor-grab"
          )}
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
          onMouseDown={(e) => handleMouseDown(e, area.id)}
        >
          {/* Action Buttons */}
          <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onCopyArea && (
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 bg-white hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyArea(area.id);
                }}
              >
                <Copy className="h-3 w-3 text-blue-500" />
              </Button>
            )}
            {onDeleteArea && (
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 bg-white hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteArea(area.id);
                }}
              >
                <X className="h-3 w-3 text-red-500" />
              </Button>
            )}
          </div>
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm pointer-events-none">
            {area.adTypeName} #{area.slotNumber}
          </span>
        </div>
      ))}

      {/* Selection overlay */}
      {isDrawing && selectionStyle && (
        <div style={selectionStyle} />
      )}

      {/* Paste Preview */}
      {isPasteMode && (
        <div
          className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/10 rounded"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            width: 100,  // Show a fixed-size preview
            height: 50,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </div>
  );
} 
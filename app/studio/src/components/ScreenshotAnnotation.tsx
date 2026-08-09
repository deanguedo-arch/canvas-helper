import { useRef, type PointerEvent } from "react";

import type { AnnotationRect, ScreenshotAnnotation as ScreenshotAnnotationState } from "../hooks/useScreenshotAnnotation";

type ScreenshotAnnotationProps = {
  annotation: ScreenshotAnnotationState;
  onMarkerChange: (marker: AnnotationRect) => void;
  onDownload: () => void;
  onDiscard: () => void;
};

type DragStart = {
  pointerId: number;
  x: number;
  y: number;
};

function toImagePoint(event: PointerEvent<HTMLDivElement>, annotation: ScreenshotAnnotationState) {
  const bounds = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * annotation.width,
    y: ((event.clientY - bounds.top) / bounds.height) * annotation.height
  };
}

export function ScreenshotAnnotation({ annotation, onMarkerChange, onDownload, onDiscard }: ScreenshotAnnotationProps) {
  const dragStartRef = useRef<DragStart | null>(null);
  const markerStyle = {
    left: `${(annotation.marker.x / annotation.width) * 100}%`,
    top: `${(annotation.marker.y / annotation.height) * 100}%`,
    width: `${(annotation.marker.width / annotation.width) * 100}%`,
    height: `${(annotation.marker.height / annotation.height) * 100}%`
  };

  const updateDragMarker = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) {
      return;
    }
    const point = toImagePoint(event, annotation);
    onMarkerChange({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y)
    });
  };

  return (
    <section className="screenshot-annotation" data-testid="screenshot-annotation">
      <div className="section-header">
        <h4>Screenshot annotation</h4>
        <span>Ready to save</span>
      </div>
      <p className="screenshot-annotation-copy">Drag a new box if the marker needs adjustment. Saving the annotation keeps this marked PNG with the Review Set for Codex.</p>
      <div
        className="screenshot-annotation-canvas"
        role="img"
        aria-label="Captured Studio screenshot with an adjustable red selection marker"
        onPointerDown={(event) => {
          const point = toImagePoint(event, annotation);
          dragStartRef.current = { pointerId: event.pointerId, ...point };
          event.currentTarget.setPointerCapture(event.pointerId);
          onMarkerChange({ x: point.x, y: point.y, width: 0, height: 0 });
        }}
        onPointerMove={updateDragMarker}
        onPointerUp={(event) => {
          updateDragMarker(event);
          dragStartRef.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          dragStartRef.current = null;
        }}
      >
        <img src={annotation.imageUrl} alt="Captured Studio tab" />
        <span className="screenshot-annotation-marker" style={markerStyle} aria-hidden="true" />
      </div>
      <div className="inspection-actions">
        <button type="button" className="ghost-button compact" onClick={onDownload} data-testid="download-annotated-screenshot">
          Download annotated PNG
        </button>
        <button type="button" className="ghost-button compact" onClick={onDiscard}>
          Discard screenshot
        </button>
      </div>
    </section>
  );
}

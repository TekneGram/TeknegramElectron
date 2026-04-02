import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import type { BubbleRecord } from '../types/bubble';

const DEFAULT_BUBBLE_SPACING = 132;
const RAIL_PADDING = 84;
const DRAG_THRESHOLD_PX = 8;
const OVERSCROLL_LIMIT_PX = 96;
const MOMENTUM_STOP_VELOCITY = 0.01;
const MOMENTUM_FRICTION = 0.94;
const SPRING_EASE = 0.16;
const WHEEL_END_DELAY_MS = 80;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const applyRubberBand = (value: number, minimum: number, maximum: number) => {
  if (value < minimum) {
    const overshoot = minimum - value;
    return minimum - Math.min(OVERSCROLL_LIMIT_PX, overshoot * 0.35);
  }

  if (value > maximum) {
    const overshoot = value - maximum;
    return maximum + Math.min(OVERSCROLL_LIMIT_PX, overshoot * 0.35);
  }

  return value;
};

export function useBubbleWrapScroll(bubbles: BubbleRecord[]) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const wheelTimeoutRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const hasPointerCaptureRef = useRef(false);
  const dragActivatedRef = useRef(false);
  const offsetRef = useRef(0);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const [railWidth, setRailWidth] = useState(0);
  const [offsetPx, setOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [suppressClick, setSuppressClick] = useState(false);

  const maxOffsetPx = useMemo(() => {
    const usableWidth = Math.max(0, railWidth - RAIL_PADDING * 2);
    const contentWidth = Math.max(0, (bubbles.length - 1) * DEFAULT_BUBBLE_SPACING);
    return Math.max(0, contentWidth - usableWidth);
  }, [bubbles.length, railWidth]);

  useEffect(() => {
    const railElement = railRef.current;

    if (!railElement) {
      return undefined;
    }

    const updateWidth = () => {
      setRailWidth(railElement.clientWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(railElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setOffsetPx((current) => clamp(current, 0, maxOffsetPx));
  }, [maxOffsetPx]);

  useEffect(() => {
    offsetRef.current = offsetPx;
  }, [offsetPx]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      if (wheelTimeoutRef.current !== null) {
        window.clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, []);

  const stopMomentum = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const animateToBounds = () => {
    stopMomentum();

    const step = () => {
      setOffsetPx((current) => {
        const target = clamp(current, 0, maxOffsetPx);
        const delta = target - current;

        if (Math.abs(delta) < 0.5) {
          frameRef.current = null;
          return target;
        }

        frameRef.current = window.requestAnimationFrame(step);
        return current + delta * SPRING_EASE;
      });
    };

    frameRef.current = window.requestAnimationFrame(step);
  };

  const animateMomentum = () => {
    stopMomentum();

    const step = () => {
      velocityRef.current *= MOMENTUM_FRICTION;

      if (Math.abs(velocityRef.current) < MOMENTUM_STOP_VELOCITY) {
        velocityRef.current = 0;
        frameRef.current = null;
        return;
      }

      setOffsetPx((current) => {
        const next = current - velocityRef.current * 16;

        if (next < 0 || next > maxOffsetPx) {
          velocityRef.current = 0;
          frameRef.current = null;
          return applyRubberBand(next, 0, maxOffsetPx);
        }

        frameRef.current = window.requestAnimationFrame(step);
        return next;
      });
    };

    frameRef.current = window.requestAnimationFrame(step);
  };

  const nudgeOffset = (deltaPx: number) => {
    stopMomentum();
    velocityRef.current = 0;
    setOffsetPx((current) => clamp(current + deltaPx, 0, maxOffsetPx));
  };

  const scheduleWheelSettle = () => {
    if (wheelTimeoutRef.current !== null) {
      window.clearTimeout(wheelTimeoutRef.current);
    }

    wheelTimeoutRef.current = window.setTimeout(() => {
      wheelTimeoutRef.current = null;

      if (pointerIdRef.current !== null) {
        return;
      }

      if (offsetRef.current < 0 || offsetRef.current > maxOffsetPx) {
        animateToBounds();
      }
    }, WHEEL_END_DELAY_MS);
  };

  const moveLeft = () => {
    nudgeOffset(-Math.max(240, railWidth * 0.42));
  };

  const moveRight = () => {
    nudgeOffset(Math.max(240, railWidth * 0.42));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    stopMomentum();
    setSuppressClick(false);
    pointerIdRef.current = event.pointerId;
    hasPointerCaptureRef.current = false;
    dragActivatedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetPx;
    lastPointerXRef.current = event.clientX;
    lastMoveTimeRef.current = event.timeStamp;
    velocityRef.current = 0;
    dragDistanceRef.current = 0;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(deltaX));

    if (!dragActivatedRef.current && dragDistanceRef.current <= DRAG_THRESHOLD_PX) {
      return;
    }

    if (!dragActivatedRef.current) {
      dragActivatedRef.current = true;
      setIsDragging(true);
      if (!hasPointerCaptureRef.current) {
        event.currentTarget.setPointerCapture(event.pointerId);
        hasPointerCaptureRef.current = true;
      }
    }

    const nextOffset = applyRubberBand(dragStartOffsetRef.current - deltaX, 0, maxOffsetPx);
    const movementSinceLast = event.clientX - lastPointerXRef.current;
    const elapsed = Math.max(1, event.timeStamp - lastMoveTimeRef.current);

    velocityRef.current = movementSinceLast / elapsed;
    lastPointerXRef.current = event.clientX;
    lastMoveTimeRef.current = event.timeStamp;
    setOffsetPx(nextOffset);
  };

  const endDrag = (pointerId: number, currentTarget: HTMLDivElement) => {
    if (pointerIdRef.current !== pointerId) {
      return;
    }

    if (hasPointerCaptureRef.current && currentTarget.hasPointerCapture(pointerId)) {
      currentTarget.releasePointerCapture(pointerId);
    }

    pointerIdRef.current = null;
    hasPointerCaptureRef.current = false;

    if (!dragActivatedRef.current) {
      velocityRef.current = 0;
      setIsDragging(false);
      return;
    }

    dragActivatedRef.current = false;
    setIsDragging(false);

    if (dragDistanceRef.current > DRAG_THRESHOLD_PX) {
      setSuppressClick(true);
      window.setTimeout(() => setSuppressClick(false), 0);
      if (offsetRef.current < 0 || offsetRef.current > maxOffsetPx) {
        velocityRef.current = 0;
        animateToBounds();
      } else {
        animateMomentum();
      }
      return;
    }

    velocityRef.current = 0;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    endDrag(event.pointerId, event.currentTarget);
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    endDrag(event.pointerId, event.currentTarget);
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const primaryDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (primaryDelta === 0) {
      return;
    }

    event.preventDefault();
    stopMomentum();
    velocityRef.current = 0;
    setOffsetPx((current) => applyRubberBand(current + primaryDelta, 0, maxOffsetPx));
    scheduleWheelSettle();
  };

  const positions = useMemo(() => {
    const usableWidth = Math.max(railWidth - RAIL_PADDING * 2, 240);
    const centerY = 78;
    const arcDepth = 54;

    return bubbles.map((bubble, index) => {
      const x = RAIL_PADDING + index * DEFAULT_BUBBLE_SPACING - offsetPx;
      const normalized = clamp((x - RAIL_PADDING) / usableWidth, -0.35, 1.35);
      const clampedProgress = clamp(normalized, 0, 1);
      const topPx = 128 - Math.sin(clampedProgress * Math.PI) * arcDepth;

      return {
        bubble,
        leftPx: x,
        topPx: railWidth === 0 ? centerY : topPx,
      };
    });
  }, [bubbles, offsetPx, railWidth]);

  return {
    railRef,
    positions,
    isDragging,
    canMoveLeft: offsetPx > 1,
    canMoveRight: offsetPx < maxOffsetPx - 1,
    moveLeft,
    moveRight,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onWheel,
    suppressClick,
  };
}

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CursorScrubVideoProps {
  /** Optional container ref to track pointer over a broader area (e.g. Hero section) */
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export const CursorScrubVideo: React.FC<CursorScrubVideoProps> = ({
  containerRef,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const internalContainerRef = useRef<HTMLDivElement | null>(null);

  // Animation and scrubbing state refs (avoid React re-render loops on cursor move)
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const isVideoReadyRef = useRef<boolean>(false);

  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Check device capabilities & accessibility
  useEffect(() => {
    const checkTouch = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none)').matches;
      setIsTouchDevice(hasTouch);
    };

    const checkReducedMotion = () => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
    };

    checkTouch();
    checkReducedMotion();
  }, []);

  // Update target scrub progress from client coordinates
  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (isTouchDevice || prefersReducedMotion) return;

      const trackingElement =
        containerRef?.current || internalContainerRef.current;
      if (!trackingElement) return;

      const rect = trackingElement.getBoundingClientRect();
      if (rect.width <= 0) return;

      // Calculate normalized X position clamped between 0 and 1
      const normalizedX = (clientX - rect.left) / rect.width;
      const clampedX = Math.max(0, Math.min(1, normalizedX));

      targetProgressRef.current = clampedX;
      isHoveredRef.current = true;
    },
    [containerRef, isTouchDevice, prefersReducedMotion]
  );

  // RAF Smooth Scrub Loop
  useEffect(() => {
    if (isTouchDevice || prefersReducedMotion) return;

    const video = videoRef.current;
    if (!video) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const duration = video.duration || 10;
      if (isVideoReadyRef.current && duration > 0) {
        // Exponential smoothing (lerp factor ~0.14 for buttery responsive tracking)
        const diff = targetProgressRef.current - currentProgressRef.current;
        currentProgressRef.current += diff * 0.14;

        // Clamp to valid range
        currentProgressRef.current = Math.max(
          0,
          Math.min(1, currentProgressRef.current)
        );

        const targetTime = currentProgressRef.current * duration;

        // Prevent seek storms: update currentTime only if diff is significant (> 1/30th sec)
        // and video is not currently locked in a seek
        const timeDiff = Math.abs(video.currentTime - targetTime);
        if (timeDiff > 0.03 && !video.seeking) {
          try {
            if ('fastSeek' in video && typeof (video as any).fastSeek === 'function') {
              (video as any).fastSeek(targetTime);
            } else {
              video.currentTime = targetTime;
            }
          } catch {
            // Safe fallback
            video.currentTime = targetTime;
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isTouchDevice, prefersReducedMotion]);

  // Pointer event listeners on the tracking element or window
  useEffect(() => {
    if (isTouchDevice || prefersReducedMotion) return;

    const trackingElement =
      containerRef?.current || internalContainerRef.current;
    if (!trackingElement) return;

    const onPointerMove = (e: PointerEvent) => {
      handlePointerMove(e.clientX);
    };

    const onPointerLeave = () => {
      isHoveredRef.current = false;
      // Smoothly return character to resting neutral pose (0) when cursor leaves
      targetProgressRef.current = 0;
    };

    trackingElement.addEventListener('pointermove', onPointerMove, {
      passive: true,
    });
    trackingElement.addEventListener('pointerleave', onPointerLeave, {
      passive: true,
    });

    return () => {
      trackingElement.removeEventListener('pointermove', onPointerMove);
      trackingElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [containerRef, handlePointerMove, isTouchDevice, prefersReducedMotion]);

  // Video load event handlers
  const handleLoadedMetadata = () => {
    isVideoReadyRef.current = true;
    setIsLoaded(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      ref={internalContainerRef}
      className={`relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-lg lg:max-w-xl mx-auto flex items-center justify-center select-none ${className}`}
    >
      {/* Seamless transparent character viewport */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Scrubbing Video Element with WebM Alpha + MP4 Theme Fallback */}
        <video
          ref={videoRef}
          poster="/videos/character-poster.webp"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          className={`w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-90'
          }`}
          aria-hidden="true"
        >
          <source src="/videos/character-scrub.webm" type="video/webm" />
          <source src="/videos/character-scrub.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

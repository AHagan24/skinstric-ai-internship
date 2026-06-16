"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BackAction } from "@/components/back-action";
import { ProceedAction } from "@/components/proceed-action";
import { RotatingDiamonds } from "@/components/rotating-diamonds";

type CameraStatus = "init" | "live" | "captured" | "submitting" | "error";

type CameraCaptureProps = {
  /** Return to the upload options. */
  onClose: () => void;
  /** Submit the captured selfie (data URL). Resolves by navigating away; rejects on failure. */
  onConfirm: (dataUrl: string) => Promise<void>;
  /** Reuse a stream that was already authorized during setup. */
  initialStream?: MediaStream | null;
};

export function CameraCapture({
  onClose,
  onConfirm,
  initialStream = null,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
<<<<<<< HEAD
  const [status, setStatus] = useState<CameraStatus>("init");
=======
  const [status, setStatus] = useState<CameraStatus>(
    initialStream ? "live" : "init",
  );
>>>>>>> 9ea3a38 (feat(upload): add camera setup loading state)
  const [captured, setCaptured] = useState("");
  const [error, setError] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const bindStream = useCallback((stream: MediaStream) => {
    streamRef.current = stream;

<<<<<<< HEAD
    const video = videoRef.current;

    if (!video) {
      if (mountedRef.current) {
        setStatus("live");
      }
      return;
    }

    video.onloadedmetadata = null;
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play().catch(() => {
        // Autoplay is best-effort; the muted/playsInline video usually plays on its own.
      });

      if (mountedRef.current) {
        setStatus("live");
      }
    };
=======
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        // Autoplay is best-effort; the muted/playsInline video plays on its own.
      });
    }
>>>>>>> 9ea3a38 (feat(upload): add camera setup loading state)
  }, []);

  // setState happens inside the promise callbacks (after the camera responds),
  // never synchronously in the effect body.
  const requestCamera = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (!mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        bindStream(stream);
        setStatus("live");
      })
      .catch(() => {
        if (mountedRef.current) {
          setError(
            "We could not access your camera. Allow camera access or upload an image instead.",
          );
          setStatus("error");
        }
      });
  }, [bindStream]);

  useEffect(() => {
    mountedRef.current = true;

    if (initialStream) {
      bindStream(initialStream);
    } else {
      requestCamera();
    }

    return () => {
      mountedRef.current = false;
      stopStream();
    };
  }, [bindStream, initialStream, requestCamera, stopStream]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(canvas.toDataURL("image/jpeg", 0.92));
    setStatus("captured");
  };

  const handleRetake = () => {
    setCaptured("");
    setError("");
    setStatus("live");
  };

  const handleRetry = () => {
<<<<<<< HEAD
    stopStream();
=======
>>>>>>> 9ea3a38 (feat(upload): add camera setup loading state)
    setError("");
    setStatus("init");
    requestCamera();
  };

  const handleConfirm = async () => {
    if (!captured) {
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      await onConfirm(captured);
    } catch (reason) {
      if (!mountedRef.current) {
        return;
      }
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : "Analysis failed. Please retake your selfie.",
      );
      setStatus("captured");
    }
  };

  const showStill = status === "captured" || status === "submitting";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#FCFCFC] text-[#1A1B1C]">
      <p className="absolute left-5 top-16 z-10 text-left text-[11px] font-semibold uppercase leading-4 sm:left-9 sm:text-xs">
        TO START ANALYSIS
      </p>

      {status !== "error" ? (
        <div className="absolute left-1/2 top-1/2 size-[min(95vw,640px)] -translate-x-1/2 -translate-y-1/2">
          <RotatingDiamonds />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute left-1/2 top-1/2 flex w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 text-center">
          <p className="text-sm font-normal leading-6 text-[#657086] sm:text-base">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="bg-[#1A1B1C] px-6 py-2 text-sm font-normal uppercase tracking-[0.04em] text-[#FCFCFC] transition-colors duration-300 hover:bg-black"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#657086] sm:text-sm">
            {showStill ? "Great shot" : "Take a selfie"}
          </p>

          <div className="relative size-[min(64vw,380px)] overflow-hidden rounded-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`size-full -scale-x-100 object-cover ${
                showStill ? "invisible" : "visible"
              }`}
            />

            {showStill && captured ? (
              // Captured frame is a client-side data URL, so a plain <img> is appropriate here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={captured}
                alt="Captured selfie"
                className="absolute inset-0 size-full -scale-x-100 object-cover"
              />
            ) : null}

            {status === "init" ? (
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <p className="text-xs font-normal uppercase tracking-[0.08em] text-[#FCFCFC]">
                  Requesting camera…
                </p>
              </div>
            ) : null}

            {status === "submitting" ? (
              <div
                role="status"
                aria-label="Analyzing image"
                className="absolute inset-0 flex items-center justify-center bg-black/40"
              >
                <span aria-hidden="true" className="flex items-center gap-4">
                  <span className="testing-loading-dot" />
                  <span className="testing-loading-dot" />
                  <span className="testing-loading-dot" />
                </span>
              </div>
            ) : null}
          </div>

          {status === "live" ? (
            <button
              type="button"
              onClick={handleCapture}
              aria-label="Take selfie"
              className="size-16 rounded-full border-2 border-[#1A1B1C] p-1 transition-transform duration-300 hover:scale-105"
            >
              <span className="block size-full rounded-full bg-[#1A1B1C]" />
            </button>
          ) : null}

          {status === "captured" ? (
            <button
              type="button"
              onClick={handleRetake}
              className="text-sm font-normal uppercase tracking-[0.04em] text-[#1A1B1C] transition-opacity duration-300 hover:opacity-60"
            >
              Retake
            </button>
          ) : null}
        </div>
      )}

      <div className="absolute bottom-8 left-8 z-30 flex">
        <BackAction onClick={onClose} disabled={status === "submitting"} />
      </div>

      {status === "captured" ? (
        <div className="absolute bottom-8 right-8 z-30 flex">
          <ProceedAction onClick={handleConfirm} />
        </div>
      ) : null}
    </div>
  );
}

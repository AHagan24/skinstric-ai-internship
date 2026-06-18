"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProceedAction } from "@/components/proceed-action";

type CameraStatus = "init" | "live" | "captured" | "submitting" | "error";

type CameraCaptureProps = {
  onClose: () => void;
  onConfirm: (dataUrl: string) => Promise<void>;
  initialStream?: MediaStream | null;
};

const EDGE_BLUR_MASK_CLASS =
  "pointer-events-none absolute inset-0 backdrop-blur-[1.5px] [mask-image:radial-gradient(circle_at_center,transparent_56%,black_100%)]";
const GREAT_SHOT_BOX_CLASS =
  "pointer-events-none absolute inset-x-0 top-[26vh] z-20 flex justify-center px-6 [@media(width>=1920px)]:top-[254px]";

export function CameraCapture({
  onClose,
  onConfirm,
  initialStream = null,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const [videoReady, setVideoReady] = useState(false);
  const [status, setStatus] = useState<CameraStatus>(
    initialStream ? "live" : "init",
  );
  const [captured, setCaptured] = useState("");
  const [error, setError] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const bindStream = useCallback((stream: MediaStream) => {
    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        // Autoplay is best-effort; the muted/playsInline video plays on its own.
      });
    }
  }, []);

  const requestCamera = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (!mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setVideoReady(false);
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

  const hasLiveStream = useCallback(
    (stream: MediaStream | null) =>
      Boolean(
        stream?.getVideoTracks().some((track) => track.readyState === "live"),
      ),
    [],
  );

  useEffect(() => {
    mountedRef.current = true;

    if (initialStream && hasLiveStream(initialStream)) {
      bindStream(initialStream);
    } else {
      requestCamera();
    }

    return () => {
      mountedRef.current = false;
      stopStream();
    };
  }, [bindStream, hasLiveStream, initialStream, requestCamera, stopStream]);

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

    const video = videoRef.current;
    const stream = streamRef.current;

    if (video && hasLiveStream(stream)) {
      video.srcObject = stream;
      video.play().catch(() => {
        // Best-effort replay while returning to the live camera feed.
      });
      setVideoReady(video.readyState >= 2 && video.videoWidth > 0);
      setStatus("live");
      return;
    }

    setVideoReady(false);
    setStatus("init");
    requestCamera();
  };

  const handleRetry = () => {
    stopStream();
    setError("");
    setVideoReady(false);
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
  const isLive = status === "live" && videoReady;

  const handleVideoReady = () => {
    if (!mountedRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.play().catch(() => {
      // Best-effort replay once metadata is available.
    });
    setVideoReady(video.readyState >= 2 && video.videoWidth > 0);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#D1CFCA] text-[#FCFCFC]">
      <div className="absolute inset-0 bg-[#D1CFCA]" />

      {status !== "error" ? (
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onLoadedMetadata={handleVideoReady}
            onCanPlay={handleVideoReady}
            className={`size-full -scale-x-100 object-cover object-center ${
              showStill ? "invisible" : "visible"
            }`}
          />

          <EdgeBlurOverlay />

          {showStill && captured ? (
            // Captured frame is a client-side data URL, so a plain <img> is appropriate here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={captured}
              alt="Captured selfie"
              className="absolute inset-0 size-full -scale-x-100 object-cover object-center"
            />
          ) : null}

          {showStill && captured ? <EdgeBlurOverlay /> : null}

          {status === "captured" ? <GreatShotOverlay /> : null}

          {status === "init" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#D1CFCA] text-center">
              <p className="text-xs font-normal uppercase tracking-[0.08em] text-[#FCFCFC]">
                Requesting camera...
              </p>
            </div>
          ) : null}

          {status === "live" && !videoReady ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#D1CFCA] text-center">
              <p className="text-xs font-normal uppercase tracking-[0.08em] text-[#FCFCFC]">
                Starting camera...
              </p>
            </div>
          ) : null}

          {status === "submitting" ? (
            <div
              role="status"
              aria-label="Analyzing image"
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/12 px-6"
            >
              <div className="w-[min(560px,82vw)] rounded-[20px] bg-white/45 px-10 py-8 backdrop-blur-lg">
                <p className="text-center text-[clamp(24px,3vw,34px)] font-normal tracking-[-0.03em] text-black/65">
                  ANALYZING IMAGE...
                </p>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 animate-pulse rounded-full bg-black/25"
                  />
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 animate-pulse rounded-full bg-black/25 [animation-delay:150ms]"
                  />
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 animate-pulse rounded-full bg-black/25 [animation-delay:300ms]"
                  />
                </div>
              </div>
            </div>
          ) : null}

        </div>
      ) : null}

      <div className="absolute inset-x-0 top-0 z-20">
        <Image
          src="/assets/camera-header-white.png"
          alt=""
          aria-hidden="true"
          width={1920}
          height={64}
          priority
          className="h-auto w-full object-cover"
        />
      </div>

      {status === "error" ? (
        <div className="absolute left-1/2 top-1/2 z-30 flex w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 px-6 text-center">
          <p className="text-sm font-normal leading-6 text-[#FCFCFC] sm:text-base">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="border border-white/70 px-6 py-2 text-sm font-normal uppercase tracking-[0.04em] text-[#FCFCFC] transition-opacity duration-300 hover:opacity-70"
          >
            Try again
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        disabled={status === "submitting"}
        aria-label="Back"
        className="absolute bottom-8 left-8 z-30 transition-opacity duration-300 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Image
          src="/assets/camera-back-button-white.png"
          alt=""
          aria-hidden="true"
          width={44}
          height={44}
          priority
          className="h-11 w-11 object-contain"
        />
      </button>

      {isLive ? (
        <>
          <div className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 px-4">
            <Image
              src="/assets/camera-guidance.png"
              alt="To get better results make sure to have neutral expression, frontal pose, and adequate lighting."
              width={492}
              height={64}
              priority
              className="h-auto w-[min(492px,82vw)] object-contain"
            />
          </div>

          <button
            type="button"
            onClick={handleCapture}
            aria-label="Take picture"
            className="absolute right-6 top-1/2 z-20 -translate-y-1/2 transition-opacity duration-300 hover:opacity-70 md:right-10 xl:right-14"
          >
            <Image
              src="/assets/camera-take-picture.png"
              alt=""
              aria-hidden="true"
              width={169}
              height={62}
              priority
              className="h-[52px] w-auto object-contain md:h-[62px]"
            />
          </button>
        </>
      ) : null}

      {status === "captured" || status === "submitting" ? (
        <>
          {status === "captured" ? (
            <button
              type="button"
              onClick={handleRetake}
              className="absolute bottom-28 left-1/2 z-30 inline-flex min-h-10 -translate-x-1/2 items-center justify-center rounded-full bg-black/38 px-5 text-sm font-semibold uppercase tracking-[0.04em] text-[#FCFCFC] backdrop-blur-sm transition-colors duration-300 hover:bg-black/50"
            >
              Retake
            </button>
          ) : null}
          <div className="absolute bottom-8 right-8 z-30 flex">
            <ProceedAction variant="shrunk-white" onClick={handleConfirm} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function EdgeBlurOverlay() {
  return <div aria-hidden="true" className={EDGE_BLUR_MASK_CLASS} />;
}

function GreatShotOverlay() {
  return (
    <div className={GREAT_SHOT_BOX_CLASS}>
      <Image
        src="/assets/camera-great-shot-caption.png"
        alt="Great shot!"
        width={119}
        height={24}
        priority
        style={{ width: "auto" }}
        className="h-6 w-auto object-contain"
      />
    </div>
  );
}

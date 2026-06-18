"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BackAction } from "@/components/back-action";
import { CameraCapture } from "@/components/camera-capture";
import { CameraSetupState } from "@/components/camera-setup-state";
import { OptionDiamonds } from "@/components/option-diamonds";
import { SiteHeader } from "@/components/site-header";
import {
  PHASE_TWO_ENDPOINT,
  STORAGE_KEYS,
  parseDemographics,
} from "@/lib/demographics";

type UploadStep = "idle" | "processing";
type UploadMode = "select" | "camera-setup" | "camera";
type CameraModalStep = "idle" | "requesting";

const CAMERA_SETUP_DELAY_MS = 1200;
const PROGRESS_TICK_MS = 35;
const PROGRESS_HOLD_MAX = 92;
const PROGRESS_COMPLETE_MS = 420;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() ?? "");
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}

export function UploadSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraSetupTimeoutRef = useRef<number | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const [mode, setMode] = useState<UploadMode>("select");
  const [step, setStep] = useState<UploadStep>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraModalStep, setCameraModalStep] =
    useState<CameraModalStep>("idle");
  const [cameraModalError, setCameraModalError] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const isProcessing = step === "processing";
  const isRequestingCamera = cameraModalStep === "requesting";

  const clearProgressAnimation = () => {
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const clearCameraSetupDelay = () => {
    if (cameraSetupTimeoutRef.current !== null) {
      window.clearTimeout(cameraSetupTimeoutRef.current);
      cameraSetupTimeoutRef.current = null;
    }
  };

  const releaseCameraStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const resetCameraFlow = () => {
    clearCameraSetupDelay();
    releaseCameraStream(cameraStreamRef.current);
    cameraStreamRef.current = null;
    setCameraStream(null);
    setMode("select");
  };

  useEffect(() => {
    cameraStreamRef.current = cameraStream;
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      clearProgressAnimation();
      clearCameraSetupDelay();
      releaseCameraStream(cameraStreamRef.current);
    };
  }, []);

  useEffect(() => {
    if (mode !== "camera-setup" || !cameraStream) {
      return;
    }

    clearCameraSetupDelay();
    cameraSetupTimeoutRef.current = window.setTimeout(() => {
      setMode("camera");
      cameraSetupTimeoutRef.current = null;
    }, CAMERA_SETUP_DELAY_MS);

    return () => {
      clearCameraSetupDelay();
    };
  }, [cameraStream, mode]);

  const openFilePicker = () => {
    if (!isProcessing) {
      inputRef.current?.click();
    }
  };

  const openCameraModal = () => {
    if (isProcessing) {
      return;
    }

    setError("");
    setCameraModalError("");
    setCameraModalStep("idle");
    setIsCameraModalOpen(true);
  };

  const closeCameraModal = () => {
    if (isRequestingCamera) {
      return;
    }

    setCameraModalError("");
    setCameraModalStep("idle");
    setIsCameraModalOpen(false);
  };

  const confirmCameraAccess = async () => {
    if (isRequestingCamera) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraModalError(
        "Camera access is not available on this device. Please upload an image instead.",
      );
      return;
    }

    setCameraModalError("");
    setCameraModalStep("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      setIsCameraModalOpen(false);
      setCameraModalStep("idle");
      setCameraStream(stream);
      setMode("camera-setup");
    } catch {
      setCameraModalStep("idle");
      setCameraModalError(
        "Camera access was not allowed. Please allow access to continue, or upload an image instead.",
      );
    }
  };

  const startProgressAnimation = () => {
    clearProgressAnimation();
    setUploadProgress(0);
    setStep("processing");

    progressIntervalRef.current = window.setInterval(() => {
      setUploadProgress((current) => {
        if (current >= PROGRESS_HOLD_MAX) {
          return current;
        }

        const remaining = PROGRESS_HOLD_MAX - current;
        const increment = Math.max(1, remaining * 0.08);
        return Math.min(PROGRESS_HOLD_MAX, current + increment);
      });
    }, PROGRESS_TICK_MS);
  };

  const finishProgressAnimation = async () => {
    clearProgressAnimation();

    const startedAt = performance.now();

    await new Promise<void>((resolve) => {
      const tick = () => {
        const elapsed = performance.now() - startedAt;
        const next = Math.min(1, elapsed / PROGRESS_COMPLETE_MS);
        setUploadProgress(PROGRESS_HOLD_MAX + (100 - PROGRESS_HOLD_MAX) * next);

        if (next >= 1) {
          setUploadProgress(100);
          resolve();
          return;
        }

        window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    });
  };

  // Shared Phase 2 submission for both gallery uploads and selfie captures.
  // Resolves by navigating to the results page; throws on failure.
  const submitImage = async (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1];

    if (!base64) {
      throw new Error("Could not read the image file.");
    }

    startProgressAnimation();

    const response = await fetch(PHASE_TWO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 }),
    });

    if (!response.ok) {
      throw new Error("Analysis failed. Please try another image.");
    }

    const result: unknown = await response.json();
    const data =
      result && typeof result === "object" && "data" in result
        ? parseDemographics((result as { data: unknown }).data)
        : null;

    if (!data) {
      throw new Error("Analysis failed. Please try another image.");
    }

    try {
      localStorage.setItem(STORAGE_KEYS.demographics, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.uploadPreview, dataUrl);
      localStorage.removeItem(STORAGE_KEYS.actualRace);
      localStorage.removeItem(STORAGE_KEYS.actualAge);
      localStorage.removeItem(STORAGE_KEYS.actualGender);
    } catch {
      // Continue to results even when browser storage is unavailable.
    }

    await finishProgressAnimation();
    router.push("/select");
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Reset the input so re-selecting the same file fires another change event.
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setError("");
    try {
      const dataUrl = await readAsDataUrl(file);
      await submitImage(dataUrl);
    } catch (reason) {
      clearProgressAnimation();
      setUploadProgress(0);
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : "Analysis failed. Please try another image.",
      );
      setStep("idle");
    }
  };

  if (mode === "camera") {
    return (
      <section className="absolute inset-0 overflow-hidden bg-[#D1CFCA]">
        <CameraCapture
          onClose={resetCameraFlow}
          onConfirm={submitImage}
          initialStream={cameraStream}
        />
        {isProcessing ? <UploadProcessingOverlay progress={uploadProgress} /> : null}
      </section>
    );
  }

  if (mode === "camera-setup") {
    return (
      <>
        <div className="absolute inset-x-0 top-0 z-50">
          <SiteHeader />
        </div>
        <CameraSetupState onCancel={resetCameraFlow} />
      </>
    );
  }

  return (
    <section className="absolute inset-0 overflow-auto bg-[#FCFCFC] text-center min-[1080px]:overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-20">
        <SiteHeader />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {isProcessing ? (
        <UploadProcessingOverlay progress={uploadProgress} />
      ) : (
        <>
          <p className="absolute left-5 top-16 text-left text-[11px] font-semibold uppercase leading-4 sm:left-9 sm:text-xs min-[1080px]:left-8 min-[1080px]:top-[86px] min-[1080px]:text-base min-[1080px]:leading-6 min-[1080px]:tracking-[-0.02em]">
            TO START ANALYSIS
          </p>

          <div className="mx-auto mb-[140px] mt-[156px] flex w-fit min-w-[520px] flex-col items-center gap-12 px-6 min-[1080px]:absolute min-[1080px]:left-1/2 min-[1080px]:top-1/2 min-[1080px]:mb-0 min-[1080px]:mt-0 min-[1080px]:w-full min-[1080px]:max-w-[1442px] min-[1080px]:-translate-x-1/2 min-[1080px]:-translate-y-1/2 min-[1080px]:flex-row min-[1080px]:items-start min-[1080px]:justify-between min-[1080px]:px-0">
            <div className="flex flex-col items-center gap-12 min-[1080px]:contents">
              <CameraOption onActivate={openCameraModal} desktop />
              <GalleryOption onActivate={openFilePicker} desktop />
            </div>
          </div>

          <p
            id="upload-error"
            aria-live="polite"
            className="absolute bottom-24 left-1/2 z-30 max-w-[30rem] -translate-x-1/2 text-xs font-semibold text-red-700 sm:text-sm min-[1080px]:bottom-[108px]"
          >
            {error}
          </p>

          <div className="absolute bottom-8 left-8 z-30 flex">
            <BackAction
              variant="shrunk"
              onClick={() => router.push("/testing")}
              disabled={isProcessing}
            />
          </div>
        </>
      )}

      {isCameraModalOpen ? (
        <CameraConsentModal
          isRequestingCamera={isRequestingCamera}
          error={cameraModalError}
          onCancel={closeCameraModal}
          onConfirm={confirmCameraAccess}
        />
      ) : null}
    </section>
  );
}

function UploadProcessingOverlay({ progress }: { progress: number }) {
  return (
    <div
      role="status"
      aria-label={`Analyzing image ${Math.round(progress)} percent`}
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#FCFCFC]/96 px-6 text-center"
    >
      <div className="flex flex-col items-center gap-10">
        <ProgressDial progress={progress} />
        <div className="flex flex-col items-center gap-3">
          <p className="text-xl font-normal leading-none tracking-[-0.02em] text-[#1A1B1C] sm:text-2xl">
            Analyzing image
          </p>
          <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#657086] sm:text-xs">
            Preparing your results
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressDial({ progress }: { progress: number }) {
  const radius = 110;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="relative flex h-[260px] w-[260px] items-center justify-center min-[1080px]:h-[320px] min-[1080px]:w-[320px]">
      <svg
        viewBox="0 0 240 240"
        aria-hidden="true"
        className="size-full -rotate-90"
      >
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="#E6E7E8"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="#1A1B1C"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[56px] font-light leading-none tracking-[-0.06em] text-[#1A1B1C] min-[1080px]:text-[72px]">
          {Math.round(clamped)}
          <span className="align-top text-[24px] min-[1080px]:text-[32px]">%</span>
        </span>
      </div>
    </div>
  );
}

function CameraConsentModal({
  error,
  isRequestingCamera,
  onCancel,
  onConfirm,
}: {
  error: string;
  isRequestingCamera: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#FCFCFC]/38 px-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="camera-consent-title"
        aria-describedby="camera-consent-description"
        className="w-full max-w-[352px] overflow-hidden bg-[#1C1C1C] text-left text-[#F5F5F5]"
      >
        <h2
          id="camera-consent-title"
          className="px-[15px] pt-[15px] text-[13px] font-semibold uppercase leading-none tracking-[-0.01em] text-[#F5F5F5]"
        >
          ALLOW A.I. TO ACCESS YOUR CAMERA
        </h2>
        <p
          id="camera-consent-description"
          className="min-h-[70px] px-[15px] pt-3 text-[11px] leading-4 text-[#B9B9B9]"
        >
          {error ||
            "Allow access to continue into the camera flow and take your selfie for analysis."}
        </p>
        <p aria-live="polite" className="sr-only">
          {error}
        </p>
        <div className="flex h-[34px] items-center justify-end border-t border-white/70 bg-[#232323] px-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRequestingCamera}
            className="px-3 text-[13px] font-semibold uppercase leading-none text-[#D2D2D2] transition-opacity duration-300 hover:opacity-70 disabled:opacity-30"
          >
            DENY
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRequestingCamera}
            className="px-3 text-[13px] font-semibold uppercase leading-none text-[#F5F5F5] transition-opacity duration-300 hover:opacity-70 disabled:opacity-30"
          >
            {isRequestingCamera ? "ALLOWING" : "ALLOW"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CameraOption({
  onActivate,
  desktop = false,
}: {
  onActivate: () => void;
  desktop?: boolean;
}) {
  return (
    <div
      className={
        desktop
          ? "relative h-[482px] w-[520px]"
          : "relative flex h-[min(482px,44vh)] w-[min(520px,92vw)] shrink-0 items-center justify-center"
      }
    >
      <div
        className={
          desktop
            ? "absolute left-0 top-0 h-[482px] w-[482px]"
            : "absolute left-1/2 top-1/2 size-[min(482px,92vw)] -translate-x-1/2 -translate-y-1/2"
        }
      >
        <OptionDiamonds variant="camera" />
      </div>

      <button
        type="button"
        onClick={onActivate}
        aria-label="Allow A.I. to scan your face and take a selfie"
        className={
          desktop
            ? "absolute left-[173px] top-[173px] z-10 block size-[136px] transition-transform duration-300 hover:scale-105"
            : "relative z-10 block size-[136px] transition-transform duration-300 hover:scale-105"
        }
      >
        <Image
          src="/assets/camera.png"
          alt=""
          aria-hidden="true"
          width={136}
          height={136}
          loading="eager"
          className="size-full object-contain"
        />
      </button>

      <div
        className={
          desktop
            ? "pointer-events-none absolute left-[281px] top-[126px] z-20 h-[76px] w-[239px]"
            : "pointer-events-none absolute left-1/2 top-1/2 z-20 flex translate-x-[24px] -translate-y-[82px] items-start"
        }
      >
        <Image
          src="/assets/scan-connector.png"
          alt=""
          aria-hidden="true"
          width={67}
          height={60}
          unoptimized
          className={
            desktop
              ? "absolute left-0 top-[17px] h-[59px] w-[66px] object-contain"
              : "h-[46px] w-[52px] object-contain"
          }
        />
        <Image
          src="/assets/scan-label.png"
          alt=""
          aria-hidden="true"
          width={268}
          height={69}
          unoptimized
          className={
            desktop
              ? "absolute left-[72px] top-0 w-[167px] object-contain"
              : "w-[118px] object-contain"
          }
        />
      </div>
    </div>
  );
}

function GalleryOption({
  onActivate,
  desktop = false,
}: {
  onActivate: () => void;
  desktop?: boolean;
}) {
  return (
    <div
      className={
        desktop
          ? "relative h-[482px] w-[488px]"
          : "relative flex h-[min(482px,44vh)] w-[min(488px,92vw)] shrink-0 items-center justify-center"
      }
    >
      <div
        className={
          desktop
            ? "absolute left-[6px] top-0 h-[482px] w-[482px]"
            : "absolute left-1/2 top-1/2 size-[min(482px,92vw)] -translate-x-1/2 -translate-y-1/2"
        }
      >
        <OptionDiamonds variant="gallery" />
      </div>

      <button
        type="button"
        onClick={onActivate}
        aria-label="Allow A.I. to access gallery and upload an image"
        className={
          desktop
            ? "absolute left-[179px] top-[173px] z-10 block size-[136px] transition-transform duration-300 hover:scale-105"
            : "relative z-10 block size-[136px] transition-transform duration-300 hover:scale-105"
        }
        >
        <Image
          src="/assets/gallery.png"
          alt=""
          aria-hidden="true"
          width={136}
          height={136}
          className="size-full object-contain"
        />
      </button>

      <div
        className={
          desktop
            ? "pointer-events-none absolute left-0 top-[281px] z-20 h-[93px] w-[210px]"
            : "pointer-events-none absolute left-1/2 top-1/2 z-20 h-[60px] w-[160px] -translate-x-[146px] translate-y-[16px]"
        }
      >
        <Image
          src="/assets/connector-alt.png"
          alt=""
          aria-hidden="true"
          width={67}
          height={60}
          unoptimized
          className={
            desktop
              ? "absolute left-[143.67px] top-0 h-[59.37px] w-[66.33px] object-contain"
              : "absolute right-[18px] top-0 h-[44px] w-[49px] object-contain"
          }
        />
        <Image
          src="/assets/gallery-label.png"
          alt=""
          aria-hidden="true"
          width={115}
          height={35}
          loading="eager"
          unoptimized
          className={
            desktop
              ? "absolute left-0 top-[45px] w-[115px] object-contain"
              : "absolute left-0 top-[30px] w-[115px] object-contain"
          }
        />
      </div>
    </div>
  );
}

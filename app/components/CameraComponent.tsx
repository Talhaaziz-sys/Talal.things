"use client";

import { Camera, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type CameraComponentProps = {
  onCapture: (imageDataUrl: string) => void;
};

const JPEG_QUALITY = 0.88;

export default function CameraComponent({ onCapture }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setError("");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Camera is blocked. Ask a grown-up to allow it.");
    }
  }, [stopCamera]);

  useEffect(() => {
    let cancelled = false;
    stopCamera();
    void navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Camera is blocked. Ask a grown-up to allow it.");
        }
      });

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera]);

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
  };

  if (error) {
    return (
      <div className="panel-glow rounded-3xl bg-[#1a1140] p-5 text-center text-lg font-black text-[#ffef64]">
        {error}
      </div>
    );
  }

  return (
    <div className="panel-glow rounded-3xl bg-[#0d1232] p-4">
      <div className="overflow-hidden rounded-2xl border-2 border-[#be4dff]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-[4/3] w-full bg-black object-cover"
        />
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={takePhoto}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#15e9ff] px-4 py-4 text-xl font-black text-[#081028] active:scale-95"
        >
          <Camera size={26} />
          Snap
        </button>
        <button
          type="button"
          onClick={() => void startCamera()}
          className="flex items-center justify-center rounded-2xl bg-[#be4dff] px-4 py-4 text-white active:scale-95"
          aria-label="Restart camera"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}

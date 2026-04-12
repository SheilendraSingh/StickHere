"use client";

import { useMemo, useRef, useState } from "react";

interface AudioRecorderProps {
  onRecorded: (file: File) => void;
  disabled?: boolean;
}

const buildFilename = () => `audio-${Date.now()}.webm`;

export default function AudioRecorder({
  onRecorded,
  disabled = false,
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRecord = useMemo(
    () => typeof window !== "undefined" && !!navigator.mediaDevices,
    [],
  );

  const start = async () => {
    if (!canRecord || disabled || isRecording) return;
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], buildFilename(), { type: blob.type });
        onRecorded(file);
        stream.getTracks().forEach((track) => track.stop());
        chunksRef.current = [];
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Microphone access is blocked.");
    }
  };

  const stop = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || !canRecord}
        onClick={isRecording ? stop : () => void start()}
        className="rounded-md border border-[#408A71]/70 bg-[#285A48] px-3 py-2 text-xs font-semibold text-[#B0E4CC] hover:bg-[#408A71] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRecording ? "Stop Recording" : "Record Audio"}
      </button>
      {error ? <p className="text-xs text-red-200">{error}</p> : null}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Mic, Pause, Play, Square} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const VoiceRecorder = ({
  onRecordingComplete,
}: {
  onRecordingComplete: (audioBlob: Blob) => void;
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | undefined>(undefined);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<null | NodeJS.Timeout>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("Attempting to start recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("Recording stopped");
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(audioBlob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setError(null);

      console.log("Recording started");

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          console.log("Duration updated:", prev + 1);
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError(
        "Failed to access microphone. Please ensure you have granted the necessary permissions."
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
      console.log("Recording paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setIsPaused(false);
      console.log("Recording resumed");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      if (timerRef.current)
        clearInterval(timerRef.current as unknown as number);
      setIsRecording(false);
      setIsPaused(false);
      setIsModalOpen(false);

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log(event.data);
        const recordedBlob = event.data;
        // Store the recordedBlob in a state variable or global variable
        setRecordedBlob(recordedBlob);
      };

      console.log("Recording stopped and modal closed");
    }
  };


  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const playRecording = () => {
    if (recordedBlob) {
      // Stop any previously playing audio
      const existingAudio = document.querySelector('audio');
      if (existingAudio && existingAudio.paused === false) {
        existingAudio.pause();
        existingAudio.currentTime = 0; // Reset playback position
      }
  
      console.log("Recording about to be played");
      const audioURL = URL.createObjectURL(recordedBlob);
      const audioElement = new Audio(audioURL);
      audioElement.play();
      audioElement.onended = () => URL.revokeObjectURL(audioURL); // Cleanup
    }
  };

  return (
    <>
      <div
        className="mb-6 flex items-center cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <Mic className="mr-1 text-black text-xs" />
        <span className="text-sm text-black">or record a voice note</span>
      </div>
      <div
        className="mb-6 flex items-center cursor-pointer"
        onClick={() => playRecording()}
      >
        <Mic className="mr-1 text-black text-xs" />
        <span className="text-sm text-black">Play voice note</span>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Voice Note</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="text-2xl font-bold">{formatDuration(duration)}</div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex space-x-4">
              {!isRecording ? (
                <Button onClick={startRecording}>
                  <Mic className="mr-2 h-4 w-4" /> Start Recording
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button onClick={resumeRecording}>
                      <Play className="mr-2 h-4 w-4" /> Resume
                    </Button>
                  ) : (
                    <Button onClick={pauseRecording}>
                      <Pause className="mr-2 h-4 w-4" /> Pause
                    </Button>
                  )}
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="mr-2 h-4 w-4" /> Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceRecorder;

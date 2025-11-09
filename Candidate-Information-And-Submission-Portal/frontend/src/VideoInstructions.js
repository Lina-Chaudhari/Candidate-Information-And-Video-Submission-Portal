import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import Stepper from './Stepper';

export default function VideoInstructions({ candidate, onSubmit }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);
  const timerRef = useRef(0);

  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (recordedBlob && recordedBlob.preview) {
        URL.revokeObjectURL(recordedBlob.preview);
      }
    };
  }, [recordedBlob]);

  const startRecording = async () => {
    setError('');
    setRecordedBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }

      chunksRef.current = [];
      timerRef.current = 0;
      setTimer(0);

      const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? { mimeType: 'video/webm;codecs=vp9' }
        : { mimeType: 'video/webm' };

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        if (blob.size === 0) {
          setError('No video recorded.');
          return;
        }
        if (timerRef.current > 90) {
          setError('Video exceeded 90 seconds.');
          return;
        }
        const preview = URL.createObjectURL(blob);
        const blobWithPreview = Object.assign(blob, { preview });
        setRecordedBlob(blobWithPreview);
      };

      recorder.start();
      setRecording(true);

      intervalRef.current = setInterval(() => {
        timerRef.current += 1;
        setTimer(timerRef.current);
        if (timerRef.current >= 90) stopRecording();
      }, 1000);
    } catch (e) {
      setError('Camera/microphone access denied.');
    }
  };

  const stopRecording = () => {
    setError('');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    const stream = streamRef.current;

    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch (e) {
        // ignore
      }
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    setRecording(false);
  };

  const handleSubmit = async () => {
    setError('');
    if (!recordedBlob) {
      setError('Please record a video before submitting.');
      return;
    }
    if (timerRef.current > 90) {
      setError('Video exceeded 90 seconds.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    Object.entries(candidate || {}).forEach(([k, v]) => formData.append(k, v));
    formData.append('video', recordedBlob, 'response.webm');

    try {
      await axios.post('/api/candidates/submit', formData);
      onSubmit(recordedBlob);
    } catch {
      setError('Video upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeRecording = () => {
    if (recordedBlob && recordedBlob.preview) {
      URL.revokeObjectURL(recordedBlob.preview);
    }
    setRecordedBlob(null);
    setTimer(0);
    timerRef.current = 0;
  };

  const progressPercent = Math.min(100, Math.round((timer / 90) * 100));

  const step1Done = !!(candidate && candidate.firstName && candidate.lastName);
  const step2Done = !!recordedBlob;
  const currentStep = 2;

  return (
    <div className="container py-3">
      <Stepper currentStep={currentStep} completed={[step1Done, step2Done, false]} />

      <div className="row">
        <div className="col-lg-5 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Recording Instructions</h5>
              <p className="card-text">Record a short video (≤ 90s) covering:</p>
              <ul>
                <li>Brief introduction about yourself</li>
                <li>Why you are interested in this position</li>
                <li>Highlight relevant experience</li>
                <li>Your long-term career goals</li>
              </ul>
              <p className="text-muted">Allow camera & microphone access when prompted.</p>

              <div className="mt-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-secondary">Timer</span>
                  <strong>{timer}s</strong>
                </div>

                <div className="progress mt-2" style={{ height: 8 }}>
                  <div
                    className={`progress-bar ${progressPercent >= 90 ? 'bg-danger' : 'bg-info'}`}
                    role="progressbar"
                    style={{ width: `${progressPercent}%` }}
                    aria-valuenow={progressPercent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card">
            <div className="card-body">
              <video ref={videoRef} autoPlay playsInline className="w-100 border rounded mb-3" style={{ maxHeight: 360, background: '#000' }} />

              <div className="d-flex flex-wrap align-items-center gap-2">
                {!recording ? (
                  <button className="btn btn-success" onClick={startRecording}>Start</button>
                ) : (
                  <button className="btn btn-danger" onClick={stopRecording}>Stop</button>
                )}

                <button className="btn btn-primary" onClick={handleSubmit} disabled={!recordedBlob || recording || uploading}>
                  {uploading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Uploading...</>) : 'Submit'}
                </button>

                {recordedBlob && (
                  <>
                    <a href={recordedBlob.preview} target="_blank" rel="noreferrer" className="btn btn-outline-secondary">View</a>
                    <button className="btn btn-outline-danger" onClick={removeRecording}>Remove</button>
                  </>
                )}
              </div>

              <small className="form-text text-muted mt-2">Recording format: webm. Max duration: 90 seconds.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
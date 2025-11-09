import { useState } from 'react';
import CandidateForm from './CandidateForm';
import VideoInstructions from './VideoInstructions';
import ReviewPage from './ReviewPage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [step, setStep] = useState(1);
  const [candidate, setCandidate] = useState({});
  const [videoBlob, setVideoBlob] = useState(null);

  return (
    <div className="container mt-4">
      <h1>Candidate Information & Video Submission Portal</h1>
      {step === 1 && (
        <CandidateForm
          onNext={(data) => {
            setCandidate(data);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <VideoInstructions
          candidate={candidate}
          onSubmit={(blob) => {
            setVideoBlob(blob);
            setStep(3);
          }}
        />
      )}
      {step === 3 && <ReviewPage candidate={candidate} videoBlob={videoBlob} />}
    </div>
  );
}
export default App;

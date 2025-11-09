import { useEffect, useRef, useState } from 'react';
import Stepper from './Stepper';

export default function ReviewPage({ candidate = {}, videoBlob }) {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [showResume, setShowResume] = useState(true);

  useEffect(() => {
    if (!videoBlob) {
      setVideoUrl(null);
      return;
    }

    if (typeof videoBlob === 'string') {
      setVideoUrl(videoBlob);
      return;
    }

    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoBlob]);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
    }
  }, [videoUrl]);

  useEffect(() => {
    setShowResume(!!(candidate && (candidate.resumeUrl || candidate.resumeId)));
  }, [candidate]);

  const resumeUrl =
    candidate.resumeUrl ||
    (candidate.resumeId ? `/api/candidates/resume/${candidate.resumeId}` : null);

  const downloadResume = async (e) => {
    e && e.preventDefault();
    setDownloadError('');
    if (!resumeUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(resumeUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();

      let filename = 'resume.pdf';
      const cd = res.headers.get('content-disposition');
      if (cd) {
        const m = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (m && m[1]) filename = m[1].replace(/['"]/g, '');
      } else if (candidate.resumeName) {
        filename = candidate.resumeName;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setDownloadError('Failed to download resume. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formattedResumeName =
    candidate.resumeName || (candidate.resumeId ? `resume-${candidate.resumeId}.pdf` : null);

  const step1Done = !!(candidate && candidate.firstName && candidate.lastName);
  const step2Done = !!videoBlob;
  const currentStep = 3;

  return (
    <div className="container py-3">
      <Stepper currentStep={currentStep} completed={[step1Done, step2Done, true]} />

      <h3 className="mb-4">Review Your Submission</h3>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Candidate Details</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <div><strong>First Name</strong></div>
                  <div>{candidate.firstName || '—'}</div>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <div><strong>Last Name</strong></div>
                  <div>{candidate.lastName || '—'}</div>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <div><strong>Position Applied For</strong></div>
                  <div>{candidate.positionAppliedFor || '—'}</div>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <div><strong>Current Position</strong></div>
                  <div>{candidate.currentPosition || '—'}</div>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <div><strong>Experience (years)</strong></div>
                  <div>{candidate.experience ?? '—'}</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Resume</h5>

              {resumeUrl && showResume ? (
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="bg-danger text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: 56, height: 56, borderRadius: 6, fontWeight: 700 }}
                    >
                      PDF
                    </div>
                    <div>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: 260 }}>
                        {formattedResumeName}
                      </div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        {candidate.resumeSize ? `${(candidate.resumeSize / 1024 / 1024).toFixed(2)} MB` : null}
                      </div>
                    </div>
                  </div>

                  <div className="ms-auto d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={downloadResume}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Downloading...
                        </>
                      ) : (
                        'Download'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      title="Close resume preview"
                      onClick={() => setShowResume(false)}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ) : resumeUrl && !showResume ? (
                <div className="d-flex align-items-center justify-content-between">
                  <div className="text-muted">Resume preview closed.</div>
                  <div>
                    <button type="button" className="btn btn-sm btn-link" onClick={() => setShowResume(true)}>
                      Reopen
                    </button>
                    <button
                      className="btn btn-outline-primary btn-sm ms-2"
                      onClick={downloadResume}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      ) : (
                        'Download'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-muted">No resume available.</div>
              )}

              {downloadError && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  {downloadError}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Recorded Video</h5>

              {videoUrl ? (
                <div className="mb-3">
                  <div className="ratio ratio-16x9">
                    <video ref={videoRef} controls className="w-100" />
                  </div>
                  <div className="mt-3 d-flex gap-2">
                    <a href={videoUrl} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm">
                      Open in new tab
                    </a>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        URL.revokeObjectURL(videoUrl);
                        setVideoUrl(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-muted">No recording available.</div>
              )}

              <div className="mt-auto">
                <small className="text-muted">If you need to change any detail, go back and edit the form.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
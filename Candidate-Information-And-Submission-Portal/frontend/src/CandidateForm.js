import { useState, useRef } from 'react';
import axios from 'axios';
import Stepper from './Stepper';

export default function CandidateForm({ onNext }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    positionAppliedFor: '',
    currentPosition: '',
    experience: '',
  });
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const fields = [
    { label: 'First Name', name: 'firstName', type: 'text' },
    { label: 'Last Name', name: 'lastName', type: 'text' },
    { label: 'Position Applied For', name: 'positionAppliedFor', type: 'text' },
    { label: 'Current Position', name: 'currentPosition', type: 'text' },
    { label: 'Experience In Years', name: 'experience', type: 'number' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', submit: '' }));
  };

  const handleFile = (file) => {
    if (!file) {
      setResume(null);
      setErrors((prev) => ({ ...prev, resume: 'Please upload your PDF resume.' }));
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResume(null);
      setErrors((prev) => ({ ...prev, resume: 'Only PDF resumes are allowed.' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResume(null);
      setErrors((prev) => ({ ...prev, resume: 'File must be ≤ 5 MB.' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setResume(file);
    setErrors((prev) => ({ ...prev, resume: '' }));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
  };

  const removeResume = () => {
    setResume(null);
    setErrors((prev) => ({ ...prev, resume: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const err = {};
    fields.forEach((f) => {
      const val = form[f.name];
      const label = f.label;
      if (f.type === 'number') {
        if (val === '' || val === null) {
          err[f.name] = `Please enter ${label}.`;
        } else if (isNaN(Number(val)) || Number(val) < 0) {
          err[f.name] = `Please enter a valid non-negative number for ${label}.`;
        }
      } else {
        if (!val || !val.toString().trim()) {
          err[f.name] = `Please enter ${label}.`;
        }
      }
    });

    if (!resume) {
      err.resume = 'Please upload your PDF resume.';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('resume', resume);

    try {
      const res = await axios.post('/api/candidates/upload-resume', formData);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        positionAppliedFor: form.positionAppliedFor.trim(),
        currentPosition: form.currentPosition.trim(),
        experience: Number(form.experience),
        resumeId: res.data.fileId,
        resumeName: resume.name,
      };
      onNext(payload);
    } catch {
      setErrors((prev) => ({ ...prev, submit: 'Upload failed. Please try again.' }));
    }
  };

  const isStep1Complete = () => {
    for (const f of fields) {
      const v = form[f.name];
      if (f.type === 'number') {
        if (v === '' || v === null) return false;
        if (isNaN(Number(v)) || Number(v) < 0) return false;
      } else {
        if (!v || !v.toString().trim()) return false;
      }
    }
    if (!resume) return false;
    return true;
  };

  const step1Done = isStep1Complete();
  const currentStep = 1;

  return (
    <div className="container">
      <Stepper currentStep={currentStep} completed={[step1Done, false, false]} />

      <form className="mt-2" onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">First Name <span className="text-danger">*</span></label>
            <input name="firstName" className="form-control" type="text" value={form.firstName} onChange={handleChange} />
            {errors.firstName && <div className="alert alert-danger mt-2 p-2">{errors.firstName}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Last Name <span className="text-danger">*</span></label>
            <input name="lastName" className="form-control" type="text" value={form.lastName} onChange={handleChange} />
            {errors.lastName && <div className="alert alert-danger mt-2 p-2">{errors.lastName}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Position Applied For <span className="text-danger">*</span></label>
            <input id="positionAppliedFor" name="positionAppliedFor" className="form-control" type="text" value={form.positionAppliedFor} onChange={handleChange} />
            {errors.positionAppliedFor && <div className="alert alert-danger mt-2 p-2">{errors.positionAppliedFor}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Current Position <span className="text-danger">*</span></label>
            <input id="currentPosition" name="currentPosition" className="form-control" type="text" value={form.currentPosition} onChange={handleChange} />
            {errors.currentPosition && <div className="alert alert-danger mt-2 p-2">{errors.currentPosition}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Experience In Years <span className="text-danger">*</span></label>
            <input name="experience" className="form-control" type="number" inputMode="numeric" min={0} value={form.experience} onChange={handleChange} />
            {errors.experience && <div className="alert alert-danger mt-2 p-2">{errors.experience}</div>}
          </div>

          <div className="col-12">
            <label className="form-label d-block">Upload Resume (PDF ≤ 5 MB) <span className="text-danger">*</span></label>
            <div className="d-flex align-items-center gap-2">
              <input id="hiddenResumeInput" ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileInputChange} style={{ display: 'none' }} />
              <label className="btn btn-dark mb-0" htmlFor="hiddenResumeInput">Choose Resume</label>

              <div className="flex-grow-1">
                {resume ? (
                  <div className="d-flex align-items-center justify-content-between border rounded p-2">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-danger text-white d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, borderRadius: 4, fontWeight: 700 }}>PDF</div>
                      <div className="text-truncate" style={{ maxWidth: 300 }}>
                        <div className="fw-semibold">{resume.name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{(resume.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => window.open(URL.createObjectURL(resume), '_blank')}>View</button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeResume}>✕</button>
                    </div>
                  </div>
                ) : (
                  errors.resume && <div className="alert alert-danger mt-2 p-2">{errors.resume}</div>
                )}
              </div>
            </div>
          </div>

          {errors.submit && <div className="col-12"><div className="alert alert-danger">{errors.submit}</div></div>}

          <div className="col-12">
            <button className="btn btn-primary" type="submit">Next</button>
          </div>
        </div>
      </form>
    </div>
  );
}
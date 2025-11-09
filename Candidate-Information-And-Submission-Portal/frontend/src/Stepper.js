import React from 'react';

export default function Stepper({ currentStep = 1, completed = [false, false, false] }) {
  const steps = [
    { id: 1, title: 'Candidate Info' },
    { id: 2, title: 'Record Video' },
    { id: 3, title: 'Review & Submit' },
  ];

  const circle = (step) => {
    const done = !!completed[step.id - 1];
    const active = currentStep === step.id;
    const bgClass = done ? 'bg-primary' : active ? 'bg-primary' : 'bg-light';
    const txtClass = done || active ? 'text-white' : 'text-secondary';
    return (
      <div
        className={`rounded-circle d-inline-flex align-items-center justify-content-center ${bgClass} ${txtClass}`}
        style={{ width: 44, height: 44, fontWeight: 700 }}
      >
        {done ? '✓' : step.id}
      </div>
    );
  };

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center">
        {steps.map((s) => (
          <React.Fragment key={s.id}>
            <div className="text-center flex-fill">
              {circle(s)}
              <div className="mt-2 small fw-semibold">{s.title}</div>
            </div>

            {s.id < steps.length && (
              <div className="px-2" style={{ flexBasis: 100 }}>
                <div style={{ height: 4, background: '#0d6efd', borderRadius: 4 }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
import React from 'react';

const steps = [
  { id: 'upload', label: 'Upload Data', icon: '📤' },
  { id: 'recommendations', label: 'Recommendations', icon: '💡' },
  { id: 'evaluation', label: 'Evaluation', icon: '📊' },
];

const Stepper = ({ current, onNavigate }) => {
  return (
    <aside className="ga-stepper" data-testid="stepper">
      {steps.map((s) => {
        const active = current === s.id;
        return (
          <button
            key={s.id}
            className={`ga-step ${active ? 'active' : ''}`}
            onClick={() => onNavigate?.(s.id)}
            data-testid={`step-${s.id}`}
          >
            <span className="ga-step-icon">{s.icon}</span>
            <span className="ga-step-label">{s.label}</span>
          </button>
        );
      })}
    </aside>
  );
};

export default Stepper;



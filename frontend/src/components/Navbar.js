import React, { useEffect, useState } from 'react';
import MethodologyModal from './MethodologyModal';

const Navbar = () => {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('ga_dark') === '1';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (dark) {
        document.body.classList.add('dark');
        localStorage.setItem('ga_dark', '1');
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('ga_dark', '0');
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [dark]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState('methodology');

  const openModal = (section) => {
    setModalSection(section);
    setModalOpen(true);
  };

  return (
    <nav className="ga-navbar" data-testid="navbar">
      <div className="ga-nav-inner">
        <div className="ga-brand">
          <span className="ga-logo">🧠</span>
          <span className="ga-name">GrowthAI</span>
          <span className="ga-badge">AI Day Prototype</span>
        </div>
        <div className="ga-nav-actions">
          <a href="#methodology" className="ga-link" onClick={(e) => { e.preventDefault(); openModal('methodology'); }} data-testid="link-methodology">
            Methodology
          </a>
          <a href="#ethics" className="ga-link" onClick={(e) => { e.preventDefault(); openModal('ethics'); }} data-testid="link-ethics">
            Ethics
          </a>
          <button className="ga-toggle" onClick={() => setDark(!dark)} data-testid="dark-toggle">
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      <MethodologyModal open={modalOpen} onClose={() => setModalOpen(false)} section={modalSection} />
    </nav>
  );
};

export default Navbar;



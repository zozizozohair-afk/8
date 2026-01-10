'use client';
import { useState } from 'react';
import LoginModal from './LoginModal';

export default function SecretLoginTrigger() {
  const [clickCount, setClickCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleSecretClick = () => {
    const now = Date.now();
    // Reset if more than 2 seconds since last click
    if (now - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount === 6) {
        setShowLoginModal(true);
        setClickCount(0);
      }
    }
    setLastClickTime(now);
  };

  return (
    <>
      <div 
        onClick={handleSecretClick}
        className="fixed bottom-0 right-0 w-24 h-24 z-[9999] cursor-default"
        title="" // Empty title to avoid tooltip
        style={{ opacity: 0 }} // Invisible
      />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

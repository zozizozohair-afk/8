'use client';
import { useRef, useState } from 'react';
import LoginModal from './LoginModal';

export default function SecretLoginTrigger() {
  const clicks = useRef({ count: 0, last: 0 });
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSecretClick = () => {
    const now = Date.now();
    const count = now - clicks.current.last > 2000 ? 1 : clicks.current.count + 1;
    clicks.current = { count, last: now };
    if (count >= 6) {
      setShowLoginModal(true);
      clicks.current = { count: 0, last: 0 };
    }
  };

  return (
    <>
      <button
        type="button"
        data-admin-entry
        aria-label="دخول الإدارة"
        onClick={handleSecretClick}
        className="fixed bottom-0 right-0 w-6 h-6 z-[70] cursor-default opacity-0 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b7995d]"
      ><span className="sr-only">دخول الإدارة</span></button>
      {showLoginModal && <LoginModal isOpen onClose={() => setShowLoginModal(false)} />}
    </>
  );
}

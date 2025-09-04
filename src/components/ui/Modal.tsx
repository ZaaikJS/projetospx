import React, { useState, useEffect, useRef } from 'react';
import FadeIn from 'react-fade-in';
import { FaTimes } from "react-icons/fa";

type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const [show, setShow] = useState(isOpen);
  const [fade, setFade] = useState<'in' | 'out' | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const startedOutside = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      requestAnimationFrame(() => setFade('in'));
    } else if (show) {
      setFade('out');
      const timer = setTimeout(() => {
        setShow(false);
        setFade(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, show]);

  if (!show) return null;

  const isOutsideContent = (target: EventTarget | null) =>
    contentRef.current ? !contentRef.current.contains(target as Node) : true;

  return (
    <div
      className={`
        fixed top-0 left-0 bg-black/60 backdrop-blur-md w-full h-full z-40 overflow-auto p-16
        transition-opacity duration-200
        ${fade === 'in' ? 'opacity-100' : 'opacity-0'}
      `}
      onPointerDownCapture={(e) => {
        startedOutside.current = isOutsideContent(e.target);
      }}
      onPointerUp={(e) => {
        const endedOutside = isOutsideContent(e.target);
        if (startedOutside.current && endedOutside) onClose?.();
        startedOutside.current = false;
      }}
    >
      <div className="flex justify-center items-center min-h-full">
        <FadeIn>
          <div
            ref={contentRef}
            className="relative w-fit h-fit"
          >
            <FaTimes
              className="absolute -top-8 -right-8 text-3xl opacity-40 hover:opacity-80 duration-100 cursor-pointer"
              onClick={onClose}
              aria-label="Fechar"
            />
            {children}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
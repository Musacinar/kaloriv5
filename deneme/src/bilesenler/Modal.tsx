import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  acik: boolean;
  kapat: () => void;
  baslik: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ acik, kapat, baslik, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        kapat();
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        kapat();
      }
    };
    
    if (acik) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
      // Kaydırmayı engelle
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      // Kaydırmayı tekrar etkinleştir
      document.body.style.overflow = '';
    };
  }, [acik, kapat]);
  
  if (!acik) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col animate-fadeIn"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{baslik}</h2>
          <button 
            onClick={kapat}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
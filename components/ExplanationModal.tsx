import React, { useEffect, useRef } from 'react';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  explanation: string;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, title, explanation }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
      // Focus management for accessibility
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Basic styling for bold and italic based on markdown-like syntax
  const formatText = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Replace **text** with <strong>text</strong>
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Replace *text* with <em>text</em>
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Replace list items • or *
        if (line.trim().startsWith('•') || line.trim().startsWith(' •')) {
            return <li key={index} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: line.trim().substring(1).trim() }} />;
        }
        if (line.trim().startsWith('* ') && !line.includes('<em>') && !line.includes('<strong>')) { // Avoid conflict with italic/bold
             return <li key={index} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: line.trim().substring(1).trim() }} />;
        }
        return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />;
      });
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explanation-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-slate-800 p-6 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-slate-100"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="explanation-modal-title" className="text-2xl font-bold text-indigo-300">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl"
            aria-label="Itxi azalpena"
          >
            &times;
          </button>
        </div>
        <div className="prose prose-sm prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
          {formatText(explanation)}
        </div>
        <button
          onClick={onClose}
          className="mt-6 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
        >
          Ulertuta
        </button>
      </div>
    </div>
  );
};

export default ExplanationModal;

import React from 'react';
import { X } from 'lucide-react';

const avatars = [
  '/Avatars/Male1.jpg',
  '/Avatars/Male2.jpg',
  '/Avatars/Male3.jpg',
  '/Avatars/Female3.jpg',
  '/Avatars/Female2.jpg',
  '/Avatars/Female1.jpg',
];

const AvatarSelectionModal = ({ currentAvatar, onSelect, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50" />

      {/* Modal */}
      <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
        <div className="bg-zinc-800 rounded-lg shadow-xl p-6 max-w-md w-full text-zinc-300 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
            aria-label="Close avatar selection modal"
          >
            <X size={24} />
          </button>

          <h2 className="text-xl font-semibold mb-4 text-zinc-100 text-center">
            Select Your Avatar
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {avatars.map((url) => (
              <img
                key={url}
                src={url}
                alt="avatar option"
                loading="lazy"
                className={`w-30 h-30 rounded-full cursor-pointer border-2 transition-colors ${
                  currentAvatar === url
                    ? 'border-red-500 scale-105'
                    : 'border-transparent hover:border-zinc-500'
                }`}
                onClick={() => onSelect(url)}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="btn btn-outline btn-error px-8"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AvatarSelectionModal;

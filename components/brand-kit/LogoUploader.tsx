import React, { useRef } from 'react';
import { PlusIcon } from '../icons/Icons';

interface LogoUploaderProps {
  onUpload: (file: File) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 ring-indigo-500 border-2 border-dashed border-gray-300"
    >
      <PlusIcon className="w-8 h-8 text-gray-400" />
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </button>
  );
};

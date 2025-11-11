import React from 'react';

interface ImagePreviewProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemoveImage }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <img src={image} alt={`Preview ${index}`} className="h-24 w-24 object-cover rounded-md border border-gray-200" />
          <button
            type="button"
            onClick={() => onRemoveImage(index)}
            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;

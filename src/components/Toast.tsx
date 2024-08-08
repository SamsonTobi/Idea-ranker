import React from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

const variantStyles: { [key: string]: string } = {
  destructive: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const variantIcons: { [key: string]: React.ElementType } = {
  destructive: AlertTriangle,
  warning: AlertCircle,
  success: CheckCircle,
  info: Info,
};

export const Toast = ({ variant = 'info', title, description, onClose }: { variant: string, title: string, description: string, onClose: () => void }) => {
  const Icon = variantIcons[variant];

  return (
    <div className={`flex absolute items-start p-4 mb-4 rounded-lg border ${variantStyles[variant]}`}>
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm">{description}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700"
      >
        <span className="sr-only">Close</span>
        <X className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

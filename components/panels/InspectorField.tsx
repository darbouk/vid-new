import React from 'react';

interface InspectorFieldProps {
  label: string;
  children: React.ReactNode;
}

export const InspectorField: React.FC<InspectorFieldProps> = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-gray-600 block mb-1.5">{label}</label>
    {children}
  </div>
);
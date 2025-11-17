import React from 'react';
import type { AppSettings } from '../../lib/settings/types';

interface SettingsFormProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSettingsChange }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        onSettingsChange({ ...settings, [name]: e.target.checked });
    } else {
        onSettingsChange({ ...settings, [name]: value });
    }
  };

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Project Name</label>
        <input
          type="text"
          name="projectName"
          value={settings.projectName}
          onChange={handleChange}
          className="w-full p-2 mt-1 bg-gray-100 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Default Quality</label>
        <select
            name="defaultResolution"
            value={settings.defaultResolution}
            onChange={handleChange}
            className="w-full p-2 mt-1 bg-gray-100 border rounded-md"
        >
            <option>720p</option>
            <option>1080p</option>
        </select>
      </div>
       <div className="flex items-center">
        <input
          id="autosave"
          name="autosave"
          type="checkbox"
          checked={settings.autosave}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
        <label htmlFor="autosave" className="ml-2 block text-sm">
          Enable Autosave
        </label>
      </div>
    </form>
  );
};
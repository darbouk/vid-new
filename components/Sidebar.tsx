import React from 'react';
import type { SidebarItemType } from '../lib/types';
import { 
    AIAgentIcon, VideoIcon, AudioIcon, ImageIcon, SubtitlesIcon, TextIcon, 
    ElementsIcon, BrandKitIcon, SettingsIcon, PlusIcon 
} from './icons/Icons';

interface SidebarProps {
  activeItem: SidebarItemType;
  setActiveItem: (item: SidebarItemType) => void;
}

const sidebarItems: { name: SidebarItemType; icon: React.ReactNode }[] = [
  { name: 'AI Agent', icon: <AIAgentIcon /> },
  { name: 'Video', icon: <VideoIcon /> },
  { name: 'Audio', icon: <AudioIcon /> },
  { name: 'Image', icon: <ImageIcon /> },
  { name: 'Subtitles', icon: <SubtitlesIcon /> },
  { name: 'Text', icon: <TextIcon /> },
  { name: 'Elements', icon: <ElementsIcon /> },
  { name: 'Brand Kit', icon: <BrandKitIcon /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activeItem, setActiveItem }) => {
  return (
    <nav className="w-16 lg:w-20 bg-gray-200/40 backdrop-blur-lg border-r border-white/30 flex flex-col items-center py-4 flex-shrink-0">
      <button className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center text-gray-700 sidebar-btn mb-6">
        <PlusIcon />
      </button>
      <ul className="flex flex-col items-center gap-4 flex-grow">
        {sidebarItems.map((item) => {
          const isActive = activeItem === item.name;
          return (
            <li key={item.name} className="w-full flex justify-center px-1">
              <button
                onClick={() => setActiveItem(item.name)}
                className={`w-full h-12 lg:h-14 flex flex-col items-center justify-center sidebar-btn ${
                  isActive ? 'sidebar-btn-active' : ''
                }`}
                aria-current={isActive}
              >
                <div className={`w-6 h-6 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-700'}`}>{item.icon}</div>
                <span className={`text-xs mt-1 transition-colors ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600'}`}>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="w-full flex justify-center px-1">
        <button
            onClick={() => setActiveItem('Settings')}
            className={`w-full h-12 lg:h-14 flex flex-col items-center justify-center sidebar-btn ${
              activeItem === 'Settings' ? 'sidebar-btn-active' : ''
            }`}
        >
            <div className={`w-6 h-6 transition-colors ${activeItem === 'Settings' ? 'text-indigo-600' : 'text-gray-700'}`}><SettingsIcon /></div>
            <span className={`text-xs mt-1 transition-colors ${activeItem === 'Settings' ? 'text-indigo-600 font-semibold' : 'text-gray-600'}`}>Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
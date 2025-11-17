import React from 'react';
import { 
    UndoIcon, RedoIcon, SearchIcon, HelpCircleIcon, CheckIcon, 
    FilterIcon, FXIcon, SpeedIcon, TrimIcon, VolumeIcon, BGIcon, DuplicateIcon, 
    ScissorsIcon, DeleteIcon, CropIcon, RotateIcon, MirrorIcon, FlipIcon, 
    ZoomIcon, FreezeIcon, UploadIcon, MenuIcon
} from './icons/Icons';

interface HeaderProps {
    onExport: () => void;
    exportDisabled: boolean;
    onMenuClick: () => void;
    onFXClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onSplit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    selection: { clips: string[] };
}

const VLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-900">
        <path d="M3.5 4.5L12 20.5L20.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ToolbarButton: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
}> = ({ icon, label, onClick, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className="flex flex-col items-center justify-center w-14 h-14 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors text-center disabled:text-gray-400 disabled:bg-transparent disabled:cursor-not-allowed disabled:hover:bg-transparent"
    aria-label={label}
    title={label}
  >
    <div className="w-6 h-6">{icon}</div>
    <span className="text-[10px] mt-1 leading-tight">{label}</span>
  </button>
);

const ToolbarDivider: React.FC = () => <div className="w-px h-10 bg-gray-200 mx-1" />;


const Header: React.FC<HeaderProps> = ({ 
    onExport, exportDisabled, onMenuClick, onFXClick, 
    onSplit, onDuplicate, onDelete, selection 
}) => {
  const isClipSelected = selection.clips.length > 0;
  const isSingleClipSelected = selection.clips.length === 1;

  return (
    <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-white border-b border-gray-200 h-20 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={onMenuClick} className="p-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 active:bg-gray-200 lg:hidden">
          <MenuIcon />
        </button>
        <VLogo />
        <span className="hidden sm:inline text-lg font-semibold text-gray-900">Project Name</span>
        <button className="hidden sm:flex p-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors active:bg-gray-200">
          <UndoIcon />
        </button>
        <button className="hidden sm:flex p-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors active:bg-gray-200">
          <RedoIcon />
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-0.5">
        <ToolbarButton icon={<FilterIcon />} label="Filter" disabled={!isClipSelected}/>
        <ToolbarButton icon={<FXIcon />} label="FX" onClick={onFXClick} />
        <ToolbarButton icon={<SpeedIcon />} label="Speed" disabled={!isClipSelected} />
        <ToolbarButton icon={<TrimIcon />} label="Trim" disabled={!isClipSelected} />
        <ToolbarButton icon={<VolumeIcon />} label="Volume" disabled={!isClipSelected} />
        <ToolbarButton icon={<BGIcon />} label="BG" />
        <ToolbarDivider />
        <ToolbarButton icon={<DuplicateIcon />} label="Duplicate" onClick={onDuplicate} disabled={!isClipSelected} />
        <ToolbarButton icon={<ScissorsIcon />} label="Split" onClick={onSplit} disabled={!isSingleClipSelected} />
        <ToolbarButton icon={<DeleteIcon />} label="Delete" onClick={onDelete} disabled={!isClipSelected} />
        <ToolbarDivider />
        <ToolbarButton icon={<CropIcon />} label="Crop" disabled={!isClipSelected} />
        <ToolbarButton icon={<RotateIcon />} label="Rotate" disabled={!isClipSelected} />
        <ToolbarButton icon={<MirrorIcon />} label="Mirror" disabled={!isClipSelected} />
        <ToolbarButton icon={<FlipIcon />} label="Flip" disabled={!isClipSelected} />
        <ToolbarDivider />
        <ToolbarButton icon={<ZoomIcon />} label="Zoom" disabled={!isClipSelected} />
        <ToolbarButton icon={<FreezeIcon />} label="Freeze" disabled={!isSingleClipSelected} />
        <ToolbarButton icon={<UploadIcon />} label="Forward" disabled={!isClipSelected} />
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden md:flex p-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors active:bg-gray-200">
          <SearchIcon />
        </button>
        <button className="hidden md:flex p-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors active:bg-gray-200">
          <HelpCircleIcon />
        </button>
        <button
          onClick={onExport}
          disabled={exportDisabled}
          className="flex items-center justify-center gap-2 p-2 sm:px-4 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <UploadIcon />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button className="flex items-center justify-center gap-2 p-2 sm:px-4 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors active:bg-indigo-800">
          <CheckIcon />
          <span className="hidden sm:inline">Done</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

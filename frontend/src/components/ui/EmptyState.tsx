import React from 'react';

// SVG illustrations for common empty states
const illustrations: Record<string, React.ReactNode> = {
  teachers: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-24 mx-auto mb-2">
      <rect x="10" y="20" width="100" height="65" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5"/>
      <rect x="22" y="32" width="40" height="4" rx="2" fill="#93C5FD"/>
      <rect x="22" y="42" width="28" height="4" rx="2" fill="#BFDBFE"/>
      <rect x="22" y="52" width="34" height="4" rx="2" fill="#BFDBFE"/>
      <circle cx="82" cy="44" r="14" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5"/>
      <circle cx="82" cy="40" r="5" fill="#93C5FD"/>
      <path d="M70 56 Q82 50 94 56" stroke="#93C5FD" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="28" y="64" width="60" height="12" rx="4" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1"/>
      <circle cx="44" cy="70" r="3" fill="#93C5FD"/>
      <circle cx="60" cy="70" r="3" fill="#93C5FD"/>
      <circle cx="76" cy="70" r="3" fill="#93C5FD"/>
    </svg>
  ),
  subjects: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-24 mx-auto mb-2">
      <rect x="20" y="15" width="34" height="48" rx="4" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1.5" transform="rotate(-8 20 15)"/>
      <rect x="24" y="16" width="34" height="48" rx="4" fill="#A7F3D0" stroke="#34D399" strokeWidth="1.5" transform="rotate(-3 30 20)"/>
      <rect x="30" y="18" width="34" height="48" rx="4" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5"/>
      <rect x="37" y="28" width="20" height="3" rx="1.5" fill="#6EE7B7"/>
      <rect x="37" y="36" width="16" height="3" rx="1.5" fill="#A7F3D0"/>
      <rect x="37" y="44" width="18" height="3" rx="1.5" fill="#A7F3D0"/>
      <rect x="37" y="52" width="14" height="3" rx="1.5" fill="#A7F3D0"/>
      <circle cx="88" cy="35" r="18" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1.5"/>
      <text x="82" y="41" fontSize="16" fill="#059669">π</text>
    </svg>
  ),
  groups: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-24 mx-auto mb-2">
      <circle cx="30" cy="42" r="12" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1.5"/>
      <circle cx="30" cy="38" r="5" fill="#FCD34D"/>
      <path d="M19 52 Q30 46 41 52" stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="60" cy="36" r="14" fill="#FEF9C3" stroke="#FBBF24" strokeWidth="1.5"/>
      <circle cx="60" cy="31" r="6" fill="#FBBF24"/>
      <path d="M47 46 Q60 39 73 46" stroke="#FBBF24" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="90" cy="42" r="12" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1.5"/>
      <circle cx="90" cy="38" r="5" fill="#FCD34D"/>
      <path d="M79 52 Q90 46 101 52" stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="20" y="62" width="80" height="18" rx="6" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1"/>
      <rect x="28" y="68" width="14" height="6" rx="2" fill="#FDE68A"/>
      <rect x="50" y="68" width="14" height="6" rx="2" fill="#FDE68A"/>
      <rect x="72" y="68" width="14" height="6" rx="2" fill="#FDE68A"/>
    </svg>
  ),
  rooms: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-24 mx-auto mb-2">
      <polygon points="60,12 100,32 100,80 20,80 20,32" fill="#F3E8FF" stroke="#C084FC" strokeWidth="1.5"/>
      <rect x="28" y="42" width="64" height="38" fill="#FAF5FF" stroke="#C084FC" strokeWidth="1"/>
      <rect x="44" y="58" width="14" height="22" rx="2" fill="#E9D5FF" stroke="#A855F7" strokeWidth="1"/>
      <rect x="64" y="56" width="18" height="10" rx="2" fill="#E9D5FF" stroke="#A855F7" strokeWidth="1"/>
      <circle cx="53" cy="67" r="1.5" fill="#A855F7"/>
      <line x1="20" y1="80" x2="100" y2="80" stroke="#C084FC" strokeWidth="2"/>
    </svg>
  ),
  assignments: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-24 mx-auto mb-2">
      <rect x="8" y="22" width="34" height="40" rx="6" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="1.5"/>
      <circle cx="25" cy="36" r="8" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1"/>
      <rect x="14" y="48" width="22" height="3" rx="1.5" fill="#A5B4FC"/>
      <rect x="78" y="22" width="34" height="40" rx="6" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5"/>
      <rect x="85" y="32" width="20" height="3" rx="1.5" fill="#86EFAC"/>
      <rect x="85" y="40" width="14" height="3" rx="1.5" fill="#BBF7D0"/>
      <rect x="85" y="48" width="16" height="3" rx="1.5" fill="#BBF7D0"/>
      <path d="M42 42 L78 42" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round"/>
      <polygon points="76,38 82,42 76,46" fill="#6366F1"/>
      <rect x="30" y="72" width="60" height="14" rx="5" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="1"/>
      <rect x="38" y="77" width="10" height="4" rx="1.5" fill="#A5B4FC"/>
      <rect x="56" y="77" width="10" height="4" rx="1.5" fill="#A5B4FC"/>
      <rect x="74" y="77" width="10" height="4" rx="1.5" fill="#A5B4FC"/>
    </svg>
  ),
  timetable: (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-24 mx-auto mb-2">
      <rect x="12" y="18" width="96" height="68" rx="8" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5"/>
      <rect x="12" y="28" width="96" height="1.5" fill="#BBF7D0"/>
      <line x1="36" y1="18" x2="36" y2="86" stroke="#D1FAE5" strokeWidth="1"/>
      <line x1="60" y1="18" x2="60" y2="86" stroke="#D1FAE5" strokeWidth="1"/>
      <line x1="84" y1="18" x2="84" y2="86" stroke="#D1FAE5" strokeWidth="1"/>
      <line x1="12" y1="46" x2="108" y2="46" stroke="#D1FAE5" strokeWidth="1"/>
      <line x1="12" y1="64" x2="108" y2="64" stroke="#D1FAE5" strokeWidth="1"/>
      <rect x="38" y="30" width="20" height="14" rx="3" fill="#4ADE80" opacity="0.7"/>
      <rect x="62" y="48" width="20" height="14" rx="3" fill="#60A5FA" opacity="0.7"/>
      <rect x="14" y="30" width="20" height="14" rx="3" fill="#F472B6" opacity="0.7"/>
      <rect x="86" y="66" width="20" height="14" rx="3" fill="#FB923C" opacity="0.7"/>
      <line x1="26" y1="7" x2="26" y2="18" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round"/>
      <line x1="94" y1="7" x2="94" y2="18" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

interface EmptyStateProps {
  icon?: string;
  illustration?: keyof typeof illustrations;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  illustration,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12 px-4">
      {illustration ? (
        illustrations[illustration]
      ) : (
        <div className="text-5xl mb-4">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
};


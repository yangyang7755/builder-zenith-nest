import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import { SettingsQuickAccess } from './SettingsQuickAccess';

interface FloatingSettingsButtonProps {
  show?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingSettingsButton({ 
  show = true,
  position = 'bottom-right' 
}: FloatingSettingsButtonProps) {
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  if (!show) return null;

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  };

  return (
    <>
      <div className={`fixed ${positionClasses[position]} z-40`}>
        <Button
          onClick={() => setShowQuickAccess(true)}
          className="w-12 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          title="Quick Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <SettingsQuickAccess 
        isOpen={showQuickAccess}
        onClose={() => setShowQuickAccess(false)}
      />
    </>
  );
}

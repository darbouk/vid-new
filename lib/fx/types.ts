import React from 'react';

export interface PhysicsTransition {
  id: string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface AppliedFX {
    transitionId: string | null;
    intensity: number; // 0-100
    speed: number;     // 0-100
}

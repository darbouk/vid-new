import { WaterIcon, GlassIcon, FabricIcon } from '../../components/icons/Icons';
import type { PhysicsTransition } from '../../lib/fx/types';

export const PHYSICS_TRANSITIONS: PhysicsTransition[] = [
    { id: 'water', name: 'Water Splash', description: 'Transition with a fluid, splashing effect.', icon: WaterIcon },
    { id: 'glass', name: 'Glass Shatter', description: 'Clips shatter to reveal the next scene.', icon: GlassIcon },
    { id: 'fabric', name: 'Fabric Drape', description: 'A soft, fabric-like wipe covers the screen.', icon: FabricIcon },
];

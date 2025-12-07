"use client";

import React, { FC, useState } from 'react';
import AnimatedCounter from "../components/landing/AnimatedCounter";
import type { LucideIcon } from 'lucide-react';
import {
  ShoppingCart,
  Heart,
  ArrowRight,
  Minus,
  Zap,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  Settings,
  Clock,
} from 'lucide-react';

type ViewMode = 'MANIFESTO' | 'LOGS';

interface NavItem {
  text: string;
  isActive: boolean;
}

const BackgroundAnimationStyles: FC = () => (
  <style>{`
    @keyframes subtlePan {
      0% { transform: translate(-50%, -50%) scale(1.1); }
      50% { transform: translate(-53%, -47%) scale(1.15); }
      100% { transform: translate(-50%, -50%) scale(1.1); }
    }
    .animate-subtle-pan {
      animation: subtlePan 60s infinite alternate ease-in-out;
    }
  `}</style>
);

//Tried so hard got so far ;(
const BackgroundAnimation: FC = () => (
  <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
    <img
      src="https://i.pinimg.com/1200x/d3/cf/e2/d3cfe21b5881b72928a0f9d5a3d79107.jpg"
      className="absolute top-1/2 left-1/2 min-w-[90%] min-h-[90%] object-cover animate-subtle-pan grayscale brightness-50"
    />
  </div>
);

interface DataStatProps {
  value: string;
  label: string;
}

const DataStat: FC<DataStatProps> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <AnimatedCounter value={value} className="text-white text-base" />
    <span className="text-gray-400 text-[8px] uppercase">{label}</span>
  </div>
);

interface SidebarIndicatorsProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

const SidebarIndicators: FC<SidebarIndicatorsProps> = ({ viewMode, setViewMode }) => (
  <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-10 z-20">
    <div className="-rotate-90 text-xs tracking-[0.5em] border px-4 py-2">
      {viewMode}
    </div>

    <button
      onClick={() => setViewMode('MANIFESTO')}
      className={`w-2 h-2 rounded-full ${viewMode === 'MANIFESTO' ? 'bg-white' : 'bg-gray-600'}`}
    />
    <button
      onClick={() => setViewMode('LOGS')}
      className={`w-2 h-2 rounded-full ${viewMode === 'LOGS' ? 'bg-white' : 'bg-gray-600'}`}
    />
  </div>
);

interface MetricBoxProps {
  value: string;
  label: string;
  color: string;
}

const MetricBox: FC<MetricBoxProps> = ({ value, label, color }) => (
  <div className="p-4 border border-white/10 bg-neutral-900/60 text-center">
    <p className={`text-3xl font-bold ${color}`}>
      <AnimatedCounter value={value} />
    </p>
    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{label}</p>
  </div>
);

//Idk man khali khali lagchilo :)
const MetricsDashboard: FC = () => (
  <div className="max-w-4xl mx-auto mt-20 p-6 border border-white/20 bg-neutral-800/40 font-mono z-20 relative">
    <div className="flex justify-between text-xs border-b pb-2 mb-4">
      <span className="flex items-center gap-2">
        <Settings className="w-4 h-4 animate-spin text-red-400" />
        SYSTEM STATUS: OPTIMAL
      </span>
      <span className="flex items-center gap-1 text-gray-400">
        <Clock className="w-3 h-3" /> 2025.04.18
      </span>
    </div>

    <div className="grid grid-cols-3 gap-6">
      <MetricBox value="99.99%" label="Integrity" color="text-green-400" />
      <MetricBox value="750k+" label="Test Cycles" color="text-yellow-400" />
      <MetricBox value="LOCKDOWN" label="Supply Chain" color="text-red-400" />
      <MetricBox value="V4.2" label="Textile Firmware" color="text-white" />
      <MetricBox value="42+" label="Distribution Nodes" color="text-white" />
      <MetricBox value="0.03%" label="Waste Output" color="text-green-400" />
    </div>
  </div>
);

const ManifestoBlock: FC = () => (
  <div className="max-w-4xl mx-auto mt-20 text-center z-20 relative">
    <p className="text-6xl font-extrabold uppercase">We Build for Endurance.</p>
    <p className="text-6xl font-extrabold uppercase text-gray-700">
      Design for Necessity.
    </p>
    <p className="text-6xl font-extrabold uppercase">Defy the Elements.</p>

    <div className="flex justify-center items-center mt-6 gap-4">
      <Minus />
      <span className="text-xs tracking-widest font-mono text-gray-400">
        // THIS IS ARMOR //
      </span>
      <Minus />
    </div>
  </div>
);

interface PillarItemProps {
  icon: LucideIcon;
  title: string;
  text: string;
}

const PillarItem: FC<PillarItemProps> = ({ icon: Icon, title, text }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <h3 className="uppercase text-sm">{title}</h3>
    </div>
    <p className="text-xs text-gray-500 mt-1">{text}</p>
  </div>
);

const PhilosophyContentView: FC = () => (
  <div className="flex px-20 pt-20 z-20 relative">
    <div className="w-1/2 pr-10">
      <h2 className="border-b pb-2 mb-4 flex items-center gap-2">
        <Zap className="text-red-400" /> ORIGIN 
      </h2>
      <p className="text-xs text-gray-400 font-mono leading-relaxed">
        Built against obsolescence. Designed for endurance. Rejecting fast
        fashion at every layer.
      </p>
    </div>

    <div className="w-1/2 pl-10 border-l border-white/20">
      <h2 className="border-b pb-2 mb-4 flex items-center gap-2">
        <Target /> CORE PILLARS
      </h2>

      <PillarItem
        icon={TrendingUp}
        title="Endurance First"
        text="Every seam is measured for resilience, not aesthetics."
      />
      <PillarItem
        icon={CheckCircle}
        title="Ethical Loop"
        text="Closed-loop manufacturing with minimal waste."
      />
      <PillarItem
        icon={Users}
        title="Community Tested"
        text="Refined through real-world conditions."
      />
    </div>
  </div>
);

const SystemLogsView: FC = () => (
  <div className="px-20 pt-20 font-mono z-20 relative text-xs">
    <p className="text-red-400 mb-4">
      ACCESS LEVEL: GUEST
    </p>
    <ul className="space-y-2">
      <li>[10:32] INIT_OK — Systems Online</li>
      <li>[11:14] QA_PASS — Structural integrity exceeded</li>
      <li>[12:05] UPDATE — Textile revision V4.2 deployed</li>
    </ul>
  </div>
);

const AboutUs: FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('MANIFESTO');

  const navItems: NavItem[] = [
    { text: 'Catalog', isActive: false },
    { text: 'About Us', isActive: true },
    { text: 'Contact Us', isActive: false },
  ];

  return (
    <div className="min-h-screen -mt-2.5 bg-neutral-900 text-white overflow-hidden relative">
      <BackgroundAnimationStyles />
      <BackgroundAnimation />
      <SidebarIndicators viewMode={viewMode} setViewMode={setViewMode} />

      <main className="pt-32 pb-20">
        <ManifestoBlock />
        <MetricsDashboard />
        {viewMode === 'MANIFESTO' ? (
          <PhilosophyContentView />
        ) : (
          <SystemLogsView />
        )}
      </main>
    </div>
  );
};

export default AboutUs;
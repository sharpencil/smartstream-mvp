'use client';

import { PulseDashboard } from "@/components/PulseDashboard";
import { MyFlowDashboard } from "@/components/MyFlowDashboard";
import { OrgOwnerDashboard } from "@/components/OrgOwnerDashboard";
import { usePersona } from "@/context/PersonaContext";

export default function Home() {
  const { activePersona, isDeepDive } = usePersona();

  return (
    <div className="h-full">
      {activePersona === 'Team Member' ? (
        <MyFlowDashboard />
      ) : activePersona === 'Org Owner' ? (
        isDeepDive ? <PulseDashboard /> : <OrgOwnerDashboard />
      ) : (
        <PulseDashboard />
      )}
    </div>
  );
}

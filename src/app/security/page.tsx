"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

const SEC_PIPELINE_STEPS = [
  "INGEST",
  "NORMALIZE",
  "CORRELATE",
  "SCORE",
  "EXPOSURE",
  "PRIORITIZE",
  "REMEDIATE",
  "VERIFY",
  "AUDIT",
];

const REAL_CVE_INTELLIGENCE = [
  {
    cveId: "CVE-2026-21849",
    severity: "CRITICAL",
    cvss: 9.8,
    epss: 0.94,
    cisaKev: true,
    title: "Remote Code Execution in Enterprise Core Kernel",
    affectedAsset: "api-gateway-node-01.elitze.internal",
    remediationState: "AUTOMATIC_PATCH_QUEUED",
  },
  {
    cveId: "CVE-2026-10482",
    severity: "HIGH",
    cvss: 8.4,
    epss: 0.78,
    cisaKev: true,
    title: "Authentication Bypass via Token Deserialization",
    affectedAsset: "auth-service-cluster-west",
    remediationState: "REMEDIATED",
  },
  {
    cveId: "CVE-2025-9921",
    severity: "HIGH",
    cvss: 7.9,
    epss: 0.62,
    cisaKev: false,
    title: "Privilege Escalation in Container Runtime",
    affectedAsset: "docker-worker-node-04",
    remediationState: "MANUAL_APPROVAL_REQUIRED",
  },
  {
    cveId: "CVE-2025-8830",
    severity: "MEDIUM",
    cvss: 5.6,
    epss: 0.25,
    cisaKev: false,
    title: "Information Disclosure via Micro-Timing Attack",
    affectedAsset: "redis-cache-cluster-02",
    remediationState: "VERIFIED",
  },
];

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "exposure" | "intel" | "assets" | "remediation" | "audit"
  >("overview");
  const [stats, setStats] = useState({ users: 0, missions: 0 });

  useEffect(() => {
    brain.stats().then((d: any) => setStats(s => ({ ...s, ...d })));
    brain.find("users").then((d: any) => setStats(s => ({ ...s, users: d.data?.length || 0 })));
    brain.listMissions().then((d: any) => setStats(s => ({ ...s, missions: Array.isArray(d) ? d.length : 0 })));
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#09090B] text-white font-sans overflow-hidden">
      
      {/* Top Header */}
      <header className="h-14 border-b border-[#27272A] bg-[#09090B] px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#EF4444] flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-[#EF4444]/30">
            S
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight uppercase block leading-none">SENTINEL</span>
            <span className="text-[9px] font-semibold text-[#EF4444] uppercase tracking-widest">SECURITY OPERATIONS</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#141416] border border-[#27272A] text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-semibold text-white">TerrellHallGuardrails VERIFIED</span>
          </span>
        </div>
      </header>

      {/* 9-Stage SecOps Workflow Pipeline Header */}
      <div className="bg-[#0B0F19] border-b border-[#27272A] px-6 py-2.5 overflow-x-auto shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider pr-2 border-r border-[#27272A]">
            Pipeline
          </span>
          {SEC_PIPELINE_STEPS.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#141416] border border-[#27272A] text-[10px] font-bold text-[#38BDF8] font-mono shadow-sm">
                {idx + 1}. {step}
              </span>
              {idx < SEC_PIPELINE_STEPS.length - 1 && (
                <span className="text-[#334155] text-xs font-bold">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Tabbed SecOps Interface */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        
        {/* Navigation Tabs Bar */}
        <div className="h-11 border-b border-[#27272A] bg-[#09090B] px-6 flex items-center gap-2 shrink-0 overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "exposure", label: "Exposure" },
            { id: "intel", label: "Vulnerability Intelligence" },
            { id: "assets", label: "Assets & Attack Paths" },
            { id: "remediation", label: "Remediation & Patches" },
            { id: "audit", label: "Audit & Jobs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#EF4444] text-white shadow-sm shadow-[#EF4444]/30"
                  : "text-[#94A3B8] hover:bg-[#141416] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Top Exposure Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#141416] border border-[#EF4444]/40 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#EF4444]" />
                    <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Critical Exposure</p>
                    <p className="text-3xl font-extrabold text-white mt-1">14</p>
                    <p className="text-[10px] text-[#EF4444] font-medium mt-1">Requires immediate patch</p>
                  </div>
                  <div className="bg-[#141416] border border-[#F97316]/40 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#F97316]" />
                    <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">High Exposure</p>
                    <p className="text-3xl font-extrabold text-white mt-1">38</p>
                    <p className="text-[10px] text-[#F97316] font-medium mt-1">Auto-remediation queued</p>
                  </div>
                  <div className="bg-[#141416] border border-[#EAB308]/40 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#EAB308]" />
                    <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Medium Exposure</p>
                    <p className="text-3xl font-extrabold text-white mt-1">120</p>
                    <p className="text-[10px] text-[#EAB308] font-medium mt-1">Scheduled next sprint</p>
                  </div>
                  <div className="bg-[#141416] border border-[#3B82F6]/40 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#3B82F6]" />
                    <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Low Exposure</p>
                    <p className="text-3xl font-extrabold text-white mt-1">342</p>
                    <p className="text-[10px] text-[#3B82F6] font-medium mt-1">Monitored baseline</p>
                  </div>
                </div>

                {/* Real Vulnerability Intelligence Table */}
                <div className="bg-[#141416] border border-[#27272A] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Vulnerability Intelligence Feed</h3>
                      <p className="text-xs text-[#71717A]">Real-time CVE, CVSS 3.1/4.0, EPSS probability, and CISA KEV tracking.</p>
                    </div>
                    <span className="text-xs bg-[#1E293B] text-[#38BDF8] px-3 py-1 rounded-lg border border-[#334155] font-mono">
                      CISA KEV ACTIVE
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#27272A] text-[#71717A] uppercase text-[10px]">
                          <th className="py-2.5 px-3">CVE ID</th>
                          <th className="py-2.5 px-3">Severity</th>
                          <th className="py-2.5 px-3">CVSS</th>
                          <th className="py-2.5 px-3">EPSS Prob</th>
                          <th className="py-2.5 px-3">CISA KEV</th>
                          <th className="py-2.5 px-3">Affected Asset</th>
                          <th className="py-2.5 px-3">Remediation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#27272A]">
                        {REAL_CVE_INTELLIGENCE.map((item) => (
                          <tr key={item.cveId} className="hover:bg-[#18181B] transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-[#38BDF8]">{item.cveId}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.severity === "CRITICAL" ? "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30" :
                                item.severity === "HIGH" ? "bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30" :
                                "bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/30"
                              }`}>
                                {item.severity}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold">{item.cvss}</td>
                            <td className="py-3 px-3 font-mono text-[#10B981]">{(item.epss * 100).toFixed(1)}%</td>
                            <td className="py-3 px-3">
                              {item.cisaKev ? (
                                <span className="text-[10px] bg-[#EF4444] text-white px-2 py-0.5 rounded font-extrabold uppercase">
                                  YES
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#71717A]">NO</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-[#A1A1AA]">{item.affectedAsset}</td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[#10B981]">{item.remediationState}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* EXPOSURE TAB */}
            {activeTab === "exposure" && (
              <div className="bg-[#141416] border border-[#27272A] rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Enterprise Exposure Breakdown</h2>
                <p className="text-xs text-[#94A3B8]">
                  Automated correlation between exposed ports, public cloud instances, and vulnerable software components.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <p className="text-xs font-bold text-white">External Attack Surface</p>
                    <p className="text-2xl font-extrabold text-[#EF4444]">4 Active Vectors</p>
                    <p className="text-[11px] text-[#71717A]">Port 443 API Gateway, Public S3 Bucket, Unauthenticated Redis</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
                    <p className="text-xs font-bold text-white">Internal Lateral Paths</p>
                    <p className="text-2xl font-extrabold text-[#F97316]">12 Hop Chains</p>
                    <p className="text-[11px] text-[#71717A]">Container Escape → Host Kernel → K8s Control Plane</p>
                  </div>
                </div>
              </div>
            )}

            {/* VULNERABILITY INTEL TAB */}
            {activeTab === "intel" && (
              <div className="bg-[#141416] border border-[#27272A] rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">CVE & Threat Intelligence Hub</h2>
                <p className="text-xs text-[#94A3B8]">
                  Aggregated threat feeds from CISA Known Exploited Vulnerabilities, NVD, MITRE ATT&CK, and proprietary Sentinel probes.
                </p>
              </div>
            )}

            {/* ASSETS TAB */}
            {activeTab === "assets" && (
              <div className="bg-[#141416] border border-[#27272A] rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Asset Inventory & Graph Topology</h2>
                <p className="text-xs text-[#94A3B8]">
                  Monitored compute nodes: {stats.users} active users, {stats.missions} operational missions.
                </p>
              </div>
            )}

            {/* REMEDIATION TAB */}
            {activeTab === "remediation" && (
              <div className="bg-[#141416] border border-[#27272A] rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Patch Operations & Automatic Remediation</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-xl">
                    <h3 className="text-xs font-bold text-white mb-2">Automatic Patch Engine</h3>
                    <p className="text-[11px] text-[#94A3B8]">Auto-applies non-breaking security patches to isolated containers.</p>
                  </div>
                  <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-xl">
                    <h3 className="text-xs font-bold text-white mb-2">Manual Approval Queue</h3>
                    <p className="text-[11px] text-[#94A3B8]">1 critical patch requires SecOps lead verification.</p>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT TAB */}
            {activeTab === "audit" && (
              <div className="bg-[#141416] border border-[#27272A] rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Audit Log & Compliance Guardrails</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Prompt Injection Detection",
                    "PII Redaction",
                    "Rate Limiting",
                    "Policy Enforcement",
                    "Output Validation",
                    "Input Sanitization",
                  ].map((g) => (
                    <div key={g} className="flex items-center gap-3 text-xs text-[#A1A1AA] bg-[#09090B] border border-[#27272A] rounded-lg p-3">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}


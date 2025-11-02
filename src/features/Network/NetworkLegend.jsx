import React from "react";
import { PARTY_COLOR } from "../../utils/partyMapping";

export default function NetworkLegend() {
  const parties = Object.keys(PARTY_COLOR).sort((a, b) => a.localeCompare(b));

  return (
    <div className="absolute left-3 top-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg max-h-[58vh] overflow-auto min-w-[220px] z-10">
      <div className="font-bold text-sm mb-2">🎨 สีพรรคการเมือง</div>
      <div className="space-y-1">
        {parties.map(party => (
          <div key={party} className="flex items-center gap-2 text-xs px-1.5 py-1 rounded hover:bg-gray-50">
            <span
              className="w-4 h-2.5 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: PARTY_COLOR[party] }}
            />
            <span className="text-xs">{party}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
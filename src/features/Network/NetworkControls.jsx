import React, { useState } from "react";

export default function NetworkControls({
  filters,
  setFilters,
  filteredBills,
  availableParties,
  availableMPs,
  onReload
}) {
  const [billSearch, setBillSearch] = useState("");

  const handleReset = () => {
    setFilters({
      dateStart: "2024-01-01",
      dateEnd: "2024-12-31",
      selectedBill: null,
      partiesSel: [],
      mpsSel: [],
    });
    setBillSearch("");
  };

  const visibleBills = filteredBills.filter(bill =>
    bill.title.toLowerCase().includes(billSearch.toLowerCase())
  );

  return (
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          
          {/* Date Range */}
          <div className="space-y-2">
            <label className="block font-bold text-sm">🗓 Date Range (End Date of Enforced Bills)</label>
            <div className="flex gap-2 items-center">
              <label className="text-sm min-w-[40px]">Start</label>
              <input
                type="date"
                value={filters.dateStart}
                onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm min-w-[40px]">End</label>
              <input
                type="date"
                value={filters.dateEnd}
                onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">* ถ้าไม่เลือก End = ใช้วันล่าสุดในข้อมูล</p>
          </div>

          {/* Party Filter */}
          <div className="space-y-2">
            <label className="block font-bold text-sm">🏛 Parties (optional filter)</label>
            <select
              multiple
              size="6"
              value={filters.partiesSel}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFilters({ ...filters, partiesSel: selected });
              }}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {availableParties.map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
          </div>

          {/* MP Filter */}
          <div className="space-y-2">
            <label className="block font-bold text-sm">🧑‍💼 MPs (optional filter)</label>
            <select
              multiple
              size="6"
              value={filters.mpsSel}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFilters({ ...filters, mpsSel: selected });
              }}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {availableMPs.map(mp => (
                <option key={mp} value={mp}>{mp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bill Selection - Full Width */}
        <div className="space-y-2 mb-4">
          <label className="block font-bold text-sm">📜 Enforced Bill (เลือก 1 อัน)</label>
          <input
            type="text"
            placeholder="พิมพ์ค้นหากฎหมาย..."
            value={billSearch}
            onChange={(e) => setBillSearch(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <select
            size="6"
            value={filters.selectedBill || ""}
            onChange={(e) => setFilters({ ...filters, selectedBill: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {visibleBills.map(bill => (
              <option key={bill.title} value={bill.title}>
                {bill.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            * เลือกกฎหมายที่ผ่านแล้ว 1 ฉบับ เพื่อนำ vote events ของฉบับนั้นมาสร้างกราฟ
          </p>
        </div>

        {/* Actions and Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onReload}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
            >
              Reload Data
            </button>
          </div>

          {/* Legend */}
          <div className="flex gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[#2ca02c]"></span>
              <span>เห็นชอบ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[#d62728]"></span>
              <span>ไม่เห็นชอบ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[#999]"></span>
              <span>อื่น ๆ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[#ffcc00]"></span>
              <span>Enforced ↔ VoteEvent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
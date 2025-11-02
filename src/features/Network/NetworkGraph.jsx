import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { getPartyColor, normalizePartyName } from "../../utils/partyMapping.js";
import { classifyVote, getVoteColor, isValidName } from "../../utils/voteHelpers.js";

export default function NetworkGraph({ events, enforcedTitle }) {
  const svgRef = useRef(null);
  const [focus, setFocus] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || !events || events.length === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const containerWidth = svgRef.current.clientWidth || window.innerWidth;
    const containerHeight = window.innerHeight * 0.7;
    
    svg.attr("width", containerWidth).attr("height", containerHeight);

    const W = containerWidth;
    const H = containerHeight;
    const cx = W / 2;
    const cy = H / 2;

    // Create layers
    const root = svg.append("g").attr("class", "root");
    const layerEN = root.append("g").attr("class", "layer-enforced");
    const layerVE = root.append("g").attr("class", "layer-ve");
    const layerVP = root.append("g").attr("class", "layer-ve-party");
    const layerVM = root.append("g").attr("class", "layer-ve-mp");
    const layerNode = root.append("g").attr("class", "layer-nodes");

    // Aggregate data
    const partyAggByVE = new Map();
    const mpByVE = new Map();

    events.forEach(ev => {
      const veId = "VE:" + ev.id;
      const pmap = partyAggByVE.get(veId) || new Map();
      const mpList = mpByVE.get(veId) || [];

      (ev.votes || []).forEach(v => {
        const party = normalizePartyName(v.voter_party);
        const vt = classifyVote(v.option);
        const c = pmap.get(party) || { yes: 0, no: 0, other: 0, total: 0, mpSet: new Set() };
        c[vt] = (c[vt] || 0) + 1;
        c.total++;
        if (isValidName(v.voter_name)) c.mpSet.add(v.voter_name);
        pmap.set(party, c);

        if (isValidName(v.voter_name)) {
          mpList.push({ name: v.voter_name, party, type: vt });
        }
      });

      const orderVote = { yes: 0, no: 1, other: 2 };
      mpList.sort((a, b) => (a.party.localeCompare(b.party) || (orderVote[a.type] - orderVote[b.type])));
      partyAggByVE.set(veId, pmap);
      mpByVE.set(veId, mpList);
    });

    // Create nodes
    const enforcedNode = {
      id: "ENFORCED:CENTER",
      group: "enforced",
      label: enforcedTitle || "Enforced Bill",
      x: cx,
      y: cy
    };

    // Vote Event nodes (circular layout)
    const BASE_R_VE = Math.min(W, H) * 0.20;
    const LAYER_STEP = 14;
    const LAYER_WOBBLE = 8;

    const veNodes = events.map((ev, i) => {
      const n = Math.max(1, events.length);
      const ang = -Math.PI + (i / n) * 2 * Math.PI;
      const r = BASE_R_VE + i * LAYER_STEP + ((i % 2 === 0) ? +LAYER_WOBBLE : -LAYER_WOBBLE);
      const x = cx + r * Math.cos(ang);
      const y = cy + r * Math.sin(ang);
      return {
        id: "VE:" + ev.id,
        group: "ve",
        label: ev.title,
        ang,
        rad: r,
        x,
        y,
        homeX: x,
        homeY: y,
        eventData: ev
      };
    });

    // Party nodes per VE
    const PARTY_GAP = 150;
    const partyNodes = [];
    const links_ve_party = [];

    veNodes.forEach((veNode, idxVE) => {
      const pmap = partyAggByVE.get(veNode.id) || new Map();
      const parties = Array.from(pmap.keys()).sort((a, b) => a.localeCompare(b));
      const spread = Math.PI / Math.max(6, parties.length);
      const start = veNode.ang - (spread * (parties.length - 1)) / 2;
      const R_P_BASE = veNode.rad + PARTY_GAP + ((idxVE % 3) - 1) * 10;
      const rScale = d3.scaleSqrt()
        .domain([1, d3.max(parties, p => (pmap.get(p)?.mpSet?.size) || 1) || 1])
        .range([7, 18]);

      parties.forEach((p, idx) => {
        const ang = start + idx * spread + ((idx % 2) ? 0.03 : -0.03);
        const r = rScale(Math.max(1, (pmap.get(p)?.mpSet?.size) || 1));
        const x = cx + R_P_BASE * Math.cos(ang);
        const y = cy + R_P_BASE * Math.sin(ang);
        const nodeId = `P:${p}#${veNode.id}`;
        const pn = {
          id: nodeId,
          raw: p,
          ve: veNode.id,
          group: "party",
          label: p,
          r: r,
          angParty: ang,
          x,
          y,
          homeX: x,
          homeY: y
        };
        partyNodes.push(pn);
        links_ve_party.push({ source: veNode, target: pn, c: pmap.get(p), kind: "vp" });
      });
    });

    // Links
    const links_en_ve = veNodes.map(v => ({ source: enforcedNode, target: v, color: "gold", kind: "enve" }));

    // Draw enforced to VE links (gold)
    layerEN.selectAll("line.enve")
      .data(links_en_ve)
      .join("line")
      .attr("class", "enve")
      .attr("stroke", "#ffcc00")
      .attr("stroke-width", 2.5)
      .attr("stroke-opacity", 0.95)
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    // Draw VE to party links (colored by vote dominant tone)
    const dominantToneColor = (counts) => {
      const total = (counts.yes || 0) + (counts.no || 0) + (counts.other || 0);
      if (!total) return "#bbb";
      const pYes = (counts.yes || 0) / total;
      const pNo = (counts.no || 0) / total;
      const pOth = (counts.other || 0) / total;
      const maxP = Math.max(pYes, pNo, pOth);
      
      if (maxP === pYes) return d3.interpolateRgb("#76c679", "#2ca02c")(maxP);
      if (maxP === pNo) return d3.interpolateRgb("#e86a6a", "#d62728")(maxP);
      return d3.interpolateRgb("#bdbdbd", "#666666")(maxP);
    };

    const pwScale = d3.scaleSqrt()
      .domain([1, d3.max(links_ve_party, l => (l.c?.total) || 1) || 1])
      .range([1.6, 7]);

    layerVP.selectAll("line.vp")
      .data(links_ve_party)
      .join("line")
      .attr("class", "vp")
      .attr("stroke", d => dominantToneColor(d.c))
      .attr("stroke-width", d => pwScale((d.c?.total) || 1))
      .attr("stroke-opacity", 1)
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    // Draw enforced node
    const gEN = layerNode.append("g")
      .attr("class", "enforced")
      .attr("transform", `translate(${enforcedNode.x},${enforcedNode.y})`);
    
    gEN.append("circle")
      .attr("r", 11.5)
      .attr("fill", "#ffcc00")
      .style("filter", "drop-shadow(0 0 4px rgba(255,204,0,.75))");

    gEN.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -16)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(enforcedNode.label);

    // Draw VE nodes
    const gVE = layerVE.selectAll("g.ve")
      .data(veNodes)
      .join("g")
      .attr("class", "ve")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    gVE.append("circle")
      .attr("r", 9)
      .attr("fill", "#555");

    // Draw party nodes
    const gParty = layerNode.selectAll("g.party")
      .data(partyNodes)
      .join("g")
      .attr("class", "party")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    gParty.append("rect")
      .attr("x", d => -d.r)
      .attr("y", d => -d.r)
      .attr("width", d => d.r * 2)
      .attr("height", d => d.r * 2)
      .attr("rx", 3)
      .attr("fill", d => getPartyColor(d.raw));

    // Tooltips for VE
    gVE.on("mouseover", (event, d) => {
      const ev = d.eventData;
      if (!ev) return;
      
      let yes = 0, no = 0, oth = 0, total = 0;
      (ev.votes || []).forEach(v => {
        const vt = classifyVote(v.option);
        if (vt === "yes") yes++;
        else if (vt === "no") no++;
        else oth++;
        total++;
      });

      setTooltip({
        visible: true,
        content: `Vote Event: ${d.label}\nเห็นชอบ: ${yes} • ไม่เห็นชอบ: ${no} • อื่น ๆ: ${oth}\nรวม: ${total}`,
        x: event.pageX,
        y: event.pageY
      });
    })
    .on("mouseout", () => {
      setTooltip({ visible: false, content: "", x: 0, y: 0 });
    });

    // Tooltips for parties
    gParty.on("mouseover", (event, d) => {
      const pmap = partyAggByVE.get(d.ve) || new Map();
      const c = pmap.get(d.raw) || { yes: 0, no: 0, other: 0, mpSet: new Set() };
      
      setTooltip({
        visible: true,
        content: `พรรค: ${d.raw}\nส.ส.: ${c.mpSet.size || 0}\nเห็นชอบ: ${c.yes || 0} • ไม่เห็นชอบ: ${c.no || 0} • อื่นๆ: ${c.other || 0}`,
        x: event.pageX,
        y: event.pageY
      });
    })
    .on("mouseout", () => {
      setTooltip({ visible: false, content: "", x: 0, y: 0 });
    });

    // Fit to view
    const allNodes = [enforcedNode, ...veNodes, ...partyNodes];
    const xs = allNodes.map(n => n.x);
    const ys = allNodes.map(n => n.y);
    const minX = Math.min(...xs) - 60;
    const maxX = Math.max(...xs) + 60;
    const minY = Math.min(...ys) - 60;
    const maxY = Math.max(...ys) + 60;
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const k = Math.min(W / width, H / height);
    const tx = (W - k * (minX + maxX)) / 2;
    const ty = (H - k * (minY + maxY)) / 2;
    root.attr("transform", `translate(${tx},${ty}) scale(${k})`);

  }, [events, enforcedTitle]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full bg-white border border-gray-200"
        style={{ height: "70vh" }}
      />
      
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed bg-black bg-opacity-90 text-white px-3 py-2 rounded text-xs whitespace-pre-wrap pointer-events-none z-50"
          style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Party Legend */}
      <PartyLegend />
    </div>
  );
}

function PartyLegend() {
  const { PARTY_COLOR } = require("../../utils/partyMapping.js");
  const parties = Object.keys(PARTY_COLOR).sort((a, b) => a.localeCompare(b));

  return (
    <div className="absolute left-4 top-4 bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg max-h-[58vh] overflow-auto min-w-[220px]">
      <div className="font-bold text-sm mb-2">🎨 สีพรรคการเมือง</div>
      <div className="space-y-1">
        {parties.map(party => (
          <div key={party} className="flex items-center gap-2 text-xs">
            <span
              className="w-4 h-2.5 rounded border border-gray-300"
              style={{ backgroundColor: PARTY_COLOR[party] }}
            />
            <span>{party}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
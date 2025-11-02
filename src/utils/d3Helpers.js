import * as d3 from "d3";
import { partyColor, VOTE_COLOR } from "./constants.js";
import { normalizePartyName, classifyVote, isValidName } from "./dataHelpers.js";

export async function drawMainOverview(svgEl, rawData) {
  const svg = d3.select(svgEl);
  const width = svg.node().clientWidth || 900;
  const height = svg.node().clientHeight || 600;
  svg.attr("width", width).attr("height", height);
  svg.selectAll("*").remove();

  const cx = width / 2, cy = height / 2;

  const nodesMap = new Map();
  nodesMap.set("ALL_BILLS", { id: "ALL_BILLS", group: "bill", label: "All Selected Bills" });

  const mpNodes = [];
  const partyNodes = new Map();

  rawData.forEach((ev) => {
    (ev.votes || []).forEach((v) => {
      const party = normalizePartyName(v.voter_party);
      const name = v.voter_name;
      if (!isValidName(name)) return;
      if (!partyNodes.has(party))
        partyNodes.set(party, { id: party, group: "party", color: partyColor(party) });
      mpNodes.push({ id: name, party, color: partyColor(party) });
    });
  });

  const parties = Array.from(partyNodes.values());
  const radius = Math.min(width, height) * 0.35;

  const angleStep = (2 * Math.PI) / parties.length;
  parties.forEach((p, i) => {
    p.x = cx + radius * Math.cos(i * angleStep);
    p.y = cy + radius * Math.sin(i * angleStep);
  });

  svg
    .append("g")
    .selectAll("line")
    .data(parties)
    .join("line")
    .attr("x1", (d) => cx)
    .attr("y1", (d) => cy)
    .attr("x2", (d) => d.x)
    .attr("y2", (d) => d.y)
    .attr("stroke", "#ccc");

  svg
    .append("circle")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", 10)
    .attr("fill", "#2ca02c");

  svg
    .append("g")
    .selectAll("circle")
    .data(parties)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 8)
    .attr("fill", (d) => d.color);
}

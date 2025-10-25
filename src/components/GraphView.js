// src/components/GraphView.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useQuery, gql } from '@apollo/client';

const GET_VOTES = gql`
  query {
    voteEvents(limit: 50) {
      id
      name
      voteDate
      voters {
        id
        name
        party {
          name
        }
        option
      }
    }
  }
`;

export default function GraphView() {
  const svgRef = useRef();

  const { data, loading, error } = useQuery(GET_VOTES);

  useEffect(() => {
    if (loading || error || !data) return;

    // สร้าง nodes และ links จากข้อมูลโหวตจริง
    const nodesMap = new Map();
    const links = [];

    data.voteEvents.forEach((event) => {
      const billNode = { id: event.id, type: 'bill', name: event.name };
      nodesMap.set(event.id, billNode);

      event.voters.forEach((voter) => {
        if (!nodesMap.has(voter.id)) {
          nodesMap.set(voter.id, {
            id: voter.id,
            name: voter.name,
            type: 'person',
            party: voter.party?.name,
          });
        }

        links.push({
          source: voter.id,
          target: event.id,
          value: voter.option === 'เห็นชอบ' ? 1 : 0.5,
        });
      });
    });

    const nodes = Array.from(nodesMap.values());

    // ตั้งค่า SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;

    svg.attr('width', width).attr('height', height);

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#aaa')
      .attr('stroke-width', (d) => d.value * 2);

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => (d.type === 'bill' ? 10 : 6))
      .attr('fill', (d) => (d.type === 'bill' ? '#ff6b6b' : '#4e79a7'))
      .call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const label = svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.name)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', 3);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      label.attr('x', (d) => d.x).attr('y', (d) => d.y);
    });
  }, [data, loading, error]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div>
      <h2>Node–Link Graph of Voting Relationships</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
}

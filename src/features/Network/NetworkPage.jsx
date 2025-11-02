import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_COMBINED_DATA } from "../../graphql/queries/getVoteEvents.js";
import NetworkControls from "./NetworkControls.jsx";
import NetworkGraph from "./NetworkGraph.jsx";
import { normalizePartyName } from "../../utils/partyMapping.js";
import { titleSimilarity, sameOrCloseDate } from "../../utils/textSimilarity.js";
import { isValidName } from "../../utils/voteHelpers.js";
import "./network.css";

export default function NetworkPage() {
  const [filters, setFilters] = useState({
    dateStart: "2024-01-01",
    dateEnd: "2024-12-31",
    selectedBill: null,
    partiesSel: [],
    mpsSel: [],
  });

  const { data, loading, error } = useQuery(GET_COMBINED_DATA);

  // Process and map bills to vote events
  const { billList, billToVotes, allVoteEvents } = useMemo(() => {
    if (!data?.voteEvents || !data?.billEnforceEvents) {
      return { billList: [], billToVotes: new Map(), allVoteEvents: [] };
    }

    // Get unique enforced bills
    const enforced = [];
    const seenKey = new Set();
    data.billEnforceEvents.forEach(b => {
      const key = `${b.title}|${b.end_date || ""}`;
      if (b.title && !seenKey.has(key)) {
        seenKey.add(key);
        enforced.push({
          title: String(b.title).trim(),
          start_date: b.start_date || null,
          end_date: b.end_date || null
        });
      }
    });

    // Map vote events to bills using fuzzy matching
    const mapping = new Map();
    enforced.forEach(b => mapping.set(b.title, []));

    const matchedVoteEvents = [];
    for (const v of data.voteEvents) {
      let bestBill = null, bestScore = 0;
      for (const b of enforced) {
        const sim = titleSimilarity(b.title, v.title);
        let score = sim;
        if (sameOrCloseDate(b.end_date, v.end_date, 7) || sameOrCloseDate(b.start_date, v.end_date, 7)) {
          score += 0.03;
        }
        if (score > bestScore) {
          bestScore = score;
          bestBill = b;
        }
      }
      if (bestBill && bestScore >= 0.75) {
        mapping.get(bestBill.title).push(v);
        matchedVoteEvents.push(v);
      }
    }

    return {
      billList: enforced,
      billToVotes: mapping,
      allVoteEvents: matchedVoteEvents
    };
  }, [data]);

  // Filter bills by date range
  const filteredBills = useMemo(() => {
    const startTime = filters.dateStart ? new Date(filters.dateStart) : new Date("1900-01-01");
    const endTime = filters.dateEnd ? new Date(filters.dateEnd) : new Date("9999-12-31");

    return billList.filter(b => {
      const d = b.end_date ? new Date(b.end_date) : (b.start_date ? new Date(b.start_date) : new Date(0));
      return d >= startTime && d <= endTime;
    }).sort((a, b) => {
      const da = a.end_date ? new Date(a.end_date) : (a.start_date ? new Date(a.start_date) : new Date(0));
      const db = b.end_date ? new Date(b.end_date) : (b.start_date ? new Date(b.start_date) : new Date(0));
      return db - da;
    });
  }, [billList, filters.dateStart, filters.dateEnd]);

  // Get vote events for selected bill
  const eventsForBill = useMemo(() => {
    if (!filters.selectedBill) return [];
    return billToVotes.get(filters.selectedBill) || [];
  }, [billToVotes, filters.selectedBill]);

  // Apply party and MP filters
  const filteredEvents = useMemo(() => {
    return eventsForBill.map(ev => {
      const votes = (ev.votes || []).filter(v => {
        const p = normalizePartyName(v.voter_party);
        const okParty = (filters.partiesSel.length === 0) || filters.partiesSel.includes(p);
        const okMP = isValidName(v.voter_name) && ((filters.mpsSel.length === 0) || filters.mpsSel.includes(v.voter_name));
        return okParty && okMP;
      }).map(v => ({ ...v, voter_party_canon: normalizePartyName(v.voter_party) }));
      return { ...ev, votes };
    }).filter(ev => ev.votes.length > 0);
  }, [eventsForBill, filters.partiesSel, filters.mpsSel]);

  // Get available parties and MPs from filtered events
  const { availableParties, availableMPs } = useMemo(() => {
    const partiesSet = new Set();
    const mpsSet = new Set();
    
    filteredEvents.forEach(ev => {
      (ev.votes || []).forEach(v => {
        partiesSet.add(v.voter_party_canon);
        if (isValidName(v.voter_name)) mpsSet.add(v.voter_name);
      });
    });

    return {
      availableParties: Array.from(partiesSet).sort((a, b) => a.localeCompare(b)),
      availableMPs: Array.from(mpsSet).sort((a, b) => a.localeCompare(b))
    };
  }, [filteredEvents]);

  if (loading) return <div className="p-8 text-center">Loading data…</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error loading data: {error.message}</div>;

  return (
    <div className="visualization-page">
      <h1 className="text-2xl font-bold text-center my-4">Political Voting Network — Interactive</h1>
      
      <NetworkControls
        filters={filters}
        setFilters={setFilters}
        filteredBills={filteredBills}
        availableParties={availableParties}
        availableMPs={availableMPs}
      />

      <NetworkGraph
        events={filteredEvents}
        enforcedTitle={filters.selectedBill}
      />

      <div className="text-center text-sm text-gray-600 mt-4">
        Bill: {filters.selectedBill || "(none)"} • Vote Events: {filteredEvents.length} • 
        Total Votes: {filteredEvents.reduce((s, e) => s + (e.votes.length || 0), 0)}
      </div>
    </div>
  );
}
import React from "react";
import { useQuery, gql } from "@apollo/client";

const GET_VOTE_EVENTS = gql`
  query GetVoteEvents(
    $startDate: Date
    $endDate: Date
    $billTitles: [String!]
    $limit: Int
    $offset: Int
  ) {
    voteEvents(
      where: {
        start_date_GTE: $startDate
        end_date_LTE: $endDate
        title_IN: $billTitles
      }
      limit: $limit
      offset: $offset
    ) {
      id
      title
      start_date
      end_date
      votes {
        voter_name
        voter_party
        option
      }
    }
  }
`;

export default function TestApollo() {
  const { data, loading, error } = useQuery(GET_VOTE_EVENTS, {
    variables: {
      limit: 10,
      // startDate: "2024-01-01",
      // endDate: "2024-12-31",
      // billTitles: ["Some Bill Title"]
    }
  });

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
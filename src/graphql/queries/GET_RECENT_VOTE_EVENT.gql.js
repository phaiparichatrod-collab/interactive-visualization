import { gql } from "@apollo/client";

const GET_RECENT_VOTE_EVENTS = gql`
  query GetRecentVoteEvents {
    voteEvents(limit: 10, sort: [{ start_date: DESC }]) {
      id
      title
      start_date
      result
      agree_count
      disagree_count
      abstain_count
      novote_count
      organizations {
        id
        name
        type
      }
    }
  }
`;

// const COMMAND_TO_QUERY = gql``; เพ่ิมตรงนี้

export default GET_RECENT_VOTE_EVENTS;

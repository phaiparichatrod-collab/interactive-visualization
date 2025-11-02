import { gql } from "@apollo/client";

export const GET_COMBINED_DATA = gql`
  query CombinedQuery {
    voteEvents {
      id
      title
      start_date
      end_date
      votes {
        id
        option
        voter_name
        voter_party
      }
    }
    billEnforceEvents {
      title
      start_date
      end_date
    }
  }
`;
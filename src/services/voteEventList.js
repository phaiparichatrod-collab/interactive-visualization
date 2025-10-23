import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_VOTE_EVENTS = gql`
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

function VoteEventList() {
    const {loading, error, data} = useQuery(GET_VOTE_EVENTS);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    if (!data || !data.voteEvents || data.voteEvents.length === 0) {
        return <p>No Data Found</p>
    }
    
    return (
        <div>
            <h2>Recent Vote Events</h2>
            <ul>
                {data.voteEvents.map(event => (
                    <li key={event.id}>
                        <strong>{event.title}</strong>
                        {/* <p>{event.start_date}</p> */}
                    </li>

                ))}
            </ul>
        </div>
    );
}

export default VoteEventList;

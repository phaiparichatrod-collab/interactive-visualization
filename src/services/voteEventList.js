import { useQuery } from "@apollo/client/react";
import GET_RECENT_VOTE_EVENTS from "../graphql/queries/GET_RECENT_VOTE_EVENT.gql";


function VoteEventList() {
    const {loading, error, data} = useQuery(GET_RECENT_VOTE_EVENTS);

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

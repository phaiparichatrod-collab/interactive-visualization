import './App.css';
import VoteEventList from './services/voteEventList';
import client from './graphql/apollo-client';
import { ApolloProvider } from '@apollo/client/react';


function App() {
  return (
    <ApolloProvider client={client}>
      <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
        <h1>Interactive Political Visualization</h1>
        <p>Connected to GraphQL API: <a href="https://politigraph.wevis.info/" target="_blank">https://politigraph.wevis.info/</a></p>
        <VoteEventList />
      </div>
    </ApolloProvider>
  );
}

export default App;

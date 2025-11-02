import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
    uri : 'https://politigraph.wevis.info/graphql',
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
});

export default client;
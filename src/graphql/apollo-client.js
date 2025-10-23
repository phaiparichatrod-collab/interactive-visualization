import { HttpLink } from '@apollo/client';
import { ApolloClient, InMemoryCache,  } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

const httpLink = new HttpLink({
    uri : 'https://politigraph.wevis.info/',
});

const authLink = new SetContextLink((_, { headers }) => {
    return {
        headers: {
            ...headers,
        }
    }
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
});

export default client;
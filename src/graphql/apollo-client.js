import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// เชื่อมต่อ GraphQL API
const httpLink = new HttpLink({
  uri: "https://politigraph.wevis.info/graphql",
});

// (ถ้าไม่มี token ก็ไม่ต้องแก้)
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;

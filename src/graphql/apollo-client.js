import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// สร้าง httpLink
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

// สร้าง authLink โดยใช้ setContext
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token"); // หรือ sessionStorage/ cookie ก็ได้
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// 1) ตั้งค่า HTTP Link (API endpoint)
const httpLink = new HttpLink({
  uri: "https://politigraph.wevis.info/v1/graphql", // เปลี่ยนตามที่โปรเจคใช้
});

// 2) (ถ้าต้องส่ง Token) ทำ Auth Link
// ถ้าไม่ใช้ Token ปล่อยให้ authLink เป็น passthrough ได้
const authLink = setContext((_, { headers }) => {
  const token = ""; // <= ใส่ token ถ้ามี
  return {
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
});

// 3) สร้าง Apollo Client + enable cache
const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;

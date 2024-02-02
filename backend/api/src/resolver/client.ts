import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: 'https://your-hasura-server-url.com/v1/graphql', // Replace with your Hasura server URL
    cache: new InMemoryCache(),
});

export default client;
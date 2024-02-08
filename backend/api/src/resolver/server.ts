import { ApolloServer, BaseContext } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { server } from "..";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export const typeDefs = `
    type Query {
        hello: String
    }

    type Subscription {
        count: Int
    }

`;

// Define your resolvers
export const resolvers = {
  Query: {
    hello: () => "Hello, world!",
  },
  Subscription: {
    hello: {
      // Example using an async generator
      subscribe: async function* () {
        for await (const word of ["Hello", "Bonjour", "Ciao"]) {
          yield { hello: word };
        }
      },
    },
    postCreated: {
      // More on pubsub below
      subscribe: () => pubsub.asyncIterator(["COUNT_INCREMENTED"]),
    },
  },
};
// Creating the WebSocket server

export const createApollo = (): ApolloServer<BaseContext> => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const apolloWss = new WebSocketServer({
    server,
    path: "/subscriptions",
  });
  const serverCleanup = useServer({ schema }, apolloWss);
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer: server }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  return apolloServer;
};

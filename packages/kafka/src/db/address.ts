import { Chain } from "@paybox/zeus";
import {
  HASURA_ADMIN_SERCRET,
  HASURA_URL,
  JWT,
  dbResStatus,
} from "@paybox/common";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
    "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
  },
});

/**
 * @param eth
 * @param sol
 * @param clientId
 * @param bitcoin
 * @param usdc
 * @returns The created address table row
 */
export const createAddress = async (
  eth: string,
  sol: string,
  clientId: string,
  bitcoin?: string,
  usdc?: string,
): Promise<{
  status: dbResStatus;
  id?: unknown;
}> => {
  const response = await chain("mutation")(
    {
      insert_address_one: [
        {
          object: {
            client_id: clientId,
            eth,
            sol,
            bitcoin,
            usdc,
          },
        },
        {
          id: true,
        },
      ],
    },
    { operationName: "createAddress" },
  );
  if (response.insert_address_one?.id) {
    return { ...response.insert_address_one, status: dbResStatus.Ok };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 * @param eth
 * @param sol
 * @param clientId
 * @param bitcoin
 * @param usdc
 * @returns checks for conflciting adderss
 */
export const conflictAddress = async (
  clientId: string,
  eth?: string,
  sol?: string,
  bitcoin?: string,
  usdc?: string,
): Promise<{
  status: dbResStatus;
  address?: {
    id?: unknown | null;
  }[];
}> => {
  const response = await chain("query")(
    {
      address: [
        {
          where: {
            _and: [
              { client_id: { _neq: clientId } },
              {
                _or: [{ eth: { _eq: eth } }, { sol: { _eq: sol } }],
              },
            ],
          },
        },
        {
          id: true,
        },
      ],
    },
    { operationName: "conflictAddress" },
  );
  if (response) {
    return {
      ...response,
      status: dbResStatus.Ok,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param client_id
 * @returns Address for the given client id
 */
export const getAddressByClientId = async (
  client_id: string,
): Promise<{
  status: dbResStatus;
  address?: {
    bitcoin?: unknown;
    eth?: unknown;
    sol?: unknown;
    usdc?: unknown;
    id?: unknown;
  }[];
}> => {
  const response = await chain("query")(
    {
      address: [
        {
          where: {
            client_id: { _eq: client_id },
          },
          limit: 1,
        },
        {
          bitcoin: true,
          eth: true,
          usdc: true,
          sol: true,
          id: true,
        },
      ],
    },
    { operationName: "getAddressByClientId" },
  );
  if (response.address[0].id) {
    return {
      ...response,
      status: dbResStatus.Ok,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param id
 * @returns updates the address
 */
export const updateAddress = async (
  clientId: string,
  eth?: string,
  sol?: string,
  bitcoin?: string,
  usdc?: string,
): Promise<{
  status: dbResStatus;
  id?: unknown;
}> => {
  const response = await chain("mutation")({
    update_address: [
      {
        where: {
          client_id: { _eq: clientId },
        },
        _set: {
          bitcoin,
          eth,
          sol,
          usdc,
        },
      },
      {
        returning: {
          id: true,
        },
      },
    ],
  });
  if (response.update_address?.returning) {
    return {
      status: dbResStatus.Ok,
      ...response.update_address?.returning,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

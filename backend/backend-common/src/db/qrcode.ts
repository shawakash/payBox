import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { Address, HASURA_ADMIN_SERCRET, dbResStatus } from "@paybox/common";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
    "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
  },
});

/**
 *
 * @param clientId
 * @returns
 */
export const getAddressByClient = async (
  clientId: string,
): Promise<{
  status: dbResStatus;
  address?: Partial<Address> & { clientId: string; id: string };
}> => {
  const response = await chain("query")({
    address: [
      {
        where: {
          client_id: { _eq: clientId },
        },
      },
      {
        id: true,
        bitcoin: true,
        client_id: true,
        eth: true,
        sol: true,
        usdc: true,
      },
    ],
  });
  if (response.address[0].id) {
    return {
      status: dbResStatus.Ok,
      address: {
        bitcoin: response.address[0].bitcoin,
        clientId,
        id: response.address[0].id as string,
        sol: response.address[0].sol,
        eth: response.address[0].eth,
        usdc: response.address[0].usdc,
      },
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

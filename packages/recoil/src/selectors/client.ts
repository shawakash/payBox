import { atom, selector, useRecoilCallback } from 'recoil';
import { addressAtom, clientAtom, payloadAtom } from '../atoms';
import { Address, AddressFormPartialType, BACKEND_URL, ClientWithJwt, responseStatus } from '@paybox/common';

export const fetchDataSelector = selector({
  key: 'fetchDataSelector',
  get: async ({ get }) => {
    try {
      const response = await fetch('your-api-endpoint');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },
});


export const createAddress = selector({
  key: 'dataSelector',
  get: async ({ get }) => {
    const payload = get(payloadAtom);
    const client = get(clientAtom);
    if(client == null) {
      console.log("Client is null");
      return;
    }
    const response = await fetch(`${BACKEND_URL}/address/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "authorization": `${client?.jwt}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  },
});



export const useAddress = () => {
  return useRecoilCallback(({ snapshot, set }) => async (payload: Partial<Address>) => {
    try {
      if(payload == null) {
        console.log("Null payload provided");
        return;
      }
      set(payloadAtom, payload);
      const data = await snapshot.getPromise(createAddress);
      console.log(data);
      if(data.status == responseStatus.Error) {
        console.log("Error in creating address");
      }
      set(addressAtom, payload);
    } catch (error) {
      console.error('Error setting payload:', error);
    }
  });
};
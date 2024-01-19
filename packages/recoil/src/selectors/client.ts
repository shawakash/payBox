import { selector } from 'recoil';

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
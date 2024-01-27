import { useState, useEffect } from 'react';

interface CreateAddressResponse {
  // Define your API response structure here
  // For example, if your API returns data in a specific format like { data: any }
  data: any;
  error: string | null;
  loading: boolean;
}

const useAddress = (url: string, requestBody: any) => {
  const [response, setResponse] = useState<CreateAddressResponse>({
    data: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setResponse((prevResponse) => ({
        ...prevResponse,
        loading: true,
        error: null,
      }));

      try {
        const apiResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
          },
          body: JSON.stringify(requestBody),
        });

        if (!apiResponse.ok) {
          throw new Error('Request failed');
        }

        const data = await apiResponse.json();
        setResponse({
          data,
          error: null,
          loading: false,
        });
      } catch (error) {
        setResponse({
          data: null,
          error: 'Error fetching data',
          loading: false,
        });
      }
    };

    fetchData();
  }, [url, requestBody]);

  return response;
};

export default useAddress;

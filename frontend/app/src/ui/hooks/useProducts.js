import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { restaurant } from '../../apollo/queries'
import { useState } from 'react'
import { useRestApi } from '.';
import NetInfo from "@react-native-community/netinfo";

export default function useProducts() {
  const { useQuery } = useRestApi();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(false);

  const refetch = async () => {
    try {
      setLoading(true);
      NetInfo.addEventListener(async (state) => {setNetworkStatus(state.isConnected);});
      const data = await useQuery('GET_PRODUCTS');
      const updatedShop = data.map((item, index) => {
        item.id = index;
        item.image = 'https://fastly.picsum.photos/id/870/200/300.jpg?blur=2&grayscale&hmac=ujRymp644uYVjdKJM7kyLDSsrqNSMVRPnGU99cKl6Vs';
        item.isAvailable = true
        item.description = "DEcriprtion"
        item.title = item.name
        return item;
      });
      setData(updatedShop);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  return { data, refetch, networkStatus, loading, error }
}

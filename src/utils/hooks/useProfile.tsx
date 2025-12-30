import React from 'react';

import { useQuery } from 'react-query';

import useAuth from 'containers/auth/AuthProvider/useAuth';

import { apiGetUserProfile } from 'api/user';
import tuple from 'utils/types/tuple';

const useProfile = () => {
  const { isLoggedIn } = useAuth();

  const query = useQuery(
    tuple([apiGetUserProfile.queryKey]),
    apiGetUserProfile,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: isLoggedIn,
      staleTime: 86400000,
    },
  );
  return query;
};

export default useProfile;

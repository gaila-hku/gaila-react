import React from 'react';

import { useQuery } from 'react-query';

import { apiGetUserProfile } from 'api/user';
import tuple from 'utils/types/tuple';

const useProfile = () => {
  const query = useQuery(
    tuple([apiGetUserProfile.queryKey]),
    apiGetUserProfile,
  );
  return query;
};

export default useProfile;

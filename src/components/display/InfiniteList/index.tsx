import React, { useEffect, useRef } from 'react';

import type { UseQueryOptions } from 'react-query';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';

import type { ListingResponse } from 'types/response';

import useInfiniteListing from './useInfiniteListing';

type Props<TData extends ListingResponse, TParam extends readonly unknown[]> = {
  queryFn: ({ queryKey }: { queryKey: TParam }) => Promise<TData>;
  queryKey: TParam;
  queryOption?: Omit<
    UseQueryOptions<TData, unknown, TData, TParam>,
    'queryKey' | 'queryFn'
  >;
  renderItem: (data: TData['value'][0]) => React.ReactNode;
  initPageLimit?: number;
  emptyPlaceholder?: React.ReactNode;
};

const InfiniteList = <
  TData extends ListingResponse,
  TParam extends readonly unknown[],
>({
  queryFn,
  queryKey,
  queryOption,
  renderItem,
  initPageLimit = 3,
  emptyPlaceholder,
}: Props<TData, TParam>) => {
  const endDiv = useRef<HTMLDivElement>(null);

  const { data, isLoading, endReached, setPages, setPageLimit, error } =
    useInfiniteListing<TData['value'][0]>({
      queryFn,
      queryKey: queryKey,
      queryOption,
      pageLimit: initPageLimit,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPageLimit(limit => (limit ?? initPageLimit) + 5);
        setPages(prev => prev + 1);
      }
    });
    const endDivEle = endDiv.current;
    if (endDivEle) {
      observer.observe(endDivEle);
    }
    return () => {
      if (endDivEle) {
        observer.unobserve(endDivEle);
      }
    };
  }, [initPageLimit, setPageLimit, setPages, data]);

  if (error) {
    return <ErrorComponent error={error} />;
  }

  if (!data.length && !isLoading && endReached) {
    return emptyPlaceholder;
  }

  return (
    <>
      {data?.map(renderItem)}
      {isLoading && <Loading className="mx-auto" />}
      {!!data.length && !endReached && <div ref={endDiv} />}
    </>
  );
};

export default InfiniteList;

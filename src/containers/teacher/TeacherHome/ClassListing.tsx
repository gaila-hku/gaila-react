import React, { useCallback, useMemo, useState } from 'react';

import { Eye, Search } from 'lucide-react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Table from 'components/display/Table';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import { apiGetClasses } from 'api/class';
import tuple from 'utils/types/tuple';

const ClassListing = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data } = useQuery(
    tuple([apiGetClasses.queryKey, { filter: search, page, limit }]),
    apiGetClasses,
  );

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onClickClass = useCallback(
    (id: number) => {
      navigate(pathnames.classDetails(String(id)));
    },
    [navigate],
  );

  const rows = useMemo(() => {
    if (!data?.value) return [];
    return data.value.map(classItem => ({
      ...classItem,
      action: (
        <Button
          className="inline-flex gap-1"
          onClick={() => onClickClass(classItem.id)}
          size="sm"
          variant="ghost"
        >
          <Eye className="h-3 w-3" />
          View
        </Button>
      ),
    }));
  }, [data?.value, onClickClass]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>Class Overview</h2>
          <p className="text-muted-foreground mt-1">
            Manage assignments and track student progress
          </p>
        </div>
        <div className="relative w-64">
          <TextInput
            className="pl-9"
            icon={<Search className=" h-4 w-4 text-muted-foreground" />}
            label="Search"
            onChange={e => handleSearchChange(e.target.value)}
            value={search}
          />
        </div>
      </div>
      <Table
        className="mb-6"
        columns={[
          { key: 'name', title: 'Class Name' },
          { key: 'description', title: 'Description' },
          { key: 'action', title: '', align: 'right' },
        ]}
        count={data?.count}
        limit={limit}
        onPageChange={setPage}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        placeholder="You don't have any classes yet"
        rows={rows}
      />
    </>
  );
};

export default ClassListing;

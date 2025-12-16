import React, { useCallback, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { PenSquare, Trash, UserPlus } from 'lucide-react';
import { useQuery } from 'react-query';

import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import Table from 'components/display/Table';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import UserListingDeleteModal from 'containers/admin/UserListing/UserListingDeleteModal';
import UserListingEditModal from 'containers/admin/UserListing/UserListingEditModal';

import { apiGetUserListing } from 'api/user';
import type { UserListingItem } from 'types/user';
import getUserName from 'utils/helper/getUserName';
import tuple from 'utils/types/tuple';

const UserListing = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTimeout, setSearchInputTimer] = useState<NodeJS.Timeout>();

  const [modalEditItem, setModalEditItem] = useState<UserListingItem | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [modalDeleteItem, setModalDeleteItem] =
    useState<UserListingItem | null>(null);

  const { data, isLoading, error } = useQuery(
    tuple([apiGetUserListing.queryKey, { page, limit, filter: searchQuery }]),
    apiGetUserListing,
  );

  const onTextFilterChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (filterTimeout) {
        clearTimeout(filterTimeout);
      }

      setSearchInputTimer(
        setTimeout(() => {
          setSearchQuery(value);
        }, 500),
      );
    },
    [filterTimeout],
  );

  const userRows = useMemo(() => {
    if (!data?.value) {
      return [];
    }
    return data.value.map(item => ({
      id: item.id,
      name: item.first_name || item.last_name ? getUserName(item) : '-',
      username: item.username,
      role: item.role,
      modified:
        item.time_created || item.time_modified
          ? dayjs(item.time_created || item.time_modified).format(
              'MMM D, YYYY h:mm A',
            )
          : '-',
      last_login: item.last_login
        ? dayjs(item.last_login).format('MMM D, YYYY h:mm A')
        : '-',
      action: (
        <div className="flex gap-2 justify-end">
          <Clickable onClick={() => setModalEditItem(item)}>
            <PenSquare className="w-4 h-4" />
          </Clickable>
          <Clickable
            className="text-red-400"
            onClick={() => setModalDeleteItem(item)}
          >
            <Trash className="w-4 h-4" />
          </Clickable>
        </div>
      ),
    }));
  }, [data]);

  return (
    <Card
      action={
        <Button className="flex gap-2" onClick={() => setIsCreating(true)}>
          <UserPlus />
          Create User
        </Button>
      }
      classes={{ description: '-mt-7 mb-2' }}
      description="View and manage all user accounts"
      title="All Users"
    >
      <TextInput
        className="!mb-4"
        onChange={e => onTextFilterChange(e.target.value)}
        placeholder="Search..."
        value={searchInput}
      />
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorComponent error={error || 'No data'} />
      ) : (
        <Table
          className="border rounded-lg"
          columns={[
            { key: 'name', title: 'Name' },
            { key: 'username', title: 'Username' },
            { key: 'role', title: 'Role' },
            { key: 'modified', title: 'Modified Date' },
            { key: 'last_login', title: 'Last Login' },
            { key: 'action', title: 'Action', align: 'right' },
          ]}
          count={data?.count}
          limit={limit}
          onPageChange={setPage}
          onRowsPerPageChange={setLimit}
          page={page}
          rows={userRows}
        />
      )}
      <UserListingEditModal
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        setUser={setModalEditItem}
        user={modalEditItem}
      />
      <UserListingDeleteModal
        deleteItem={modalDeleteItem}
        setDeleteItem={setModalDeleteItem}
      />
    </Card>
  );
};

export default UserListing;

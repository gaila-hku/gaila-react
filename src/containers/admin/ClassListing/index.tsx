import React, { useCallback, useState } from 'react';

import { FileText, Search } from 'lucide-react';

import InfiniteList from 'components/display/InfiniteList';
import TextInput from 'components/input/TextInput';

import ClassCard from 'containers/admin/ClassListing/ClassCard';
import ClassListingEditModal from 'containers/admin/ClassListing/ClassListingEditModal';

import { apiGetAllClasses } from 'api/class';
import type { ClassManagementDetail } from 'types/class';

const ClassListing = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputTimer, setSearchInputTimer] = useState<NodeJS.Timeout>();

  const [editingClass, setEditingClass] =
    useState<ClassManagementDetail | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);

      if (searchInputTimer) {
        clearTimeout(searchInputTimer);
      }

      setSearchInputTimer(
        setTimeout(() => {
          setSearchQuery(value);
        }, 500),
      );
    },
    [searchInputTimer],
  );

  return (
    <>
      <TextInput
        className="!mb-4"
        onChange={e => handleSearchChange(e.target.value)}
        placeholder="Search..."
        value={searchInput}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfiniteList
          emptyPlaceholder={
            !searchQuery ? (
              <div className="text-center py-12 col-span-3">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No classes match your filters
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find your
                  assignments
                </p>
              </div>
            ) : (
              <div className="text-center py-12 col-span-3">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg mb-2">No classes created</div>
              </div>
            )
          }
          queryFn={apiGetAllClasses}
          queryKey={[
            apiGetAllClasses.queryKey,
            { page: 1, limit: 10, filter: searchQuery },
          ]}
          renderItem={classItem => (
            <ClassCard
              classItem={classItem}
              key={classItem.id}
              setEditingClass={setEditingClass}
            />
          )}
        />
      </div>
      <ClassListingEditModal
        classItem={editingClass}
        setClassItem={setEditingClass}
      />
    </>
  );
};

export default ClassListing;

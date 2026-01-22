import React, { useCallback, useState } from 'react';

import dayjs from 'dayjs';
import { Clock, Edit, FileText, Filter, Search, SortAsc } from 'lucide-react';
import { useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import InfiniteList from 'components/display/InfiniteList';
import Button from 'components/input/Button';
import SelectInput from 'components/input/SelectInput';
import TextInput from 'components/input/TextInput';

import {
  getBadgeText,
  getStatusClass,
  getStatusText,
  getWordRequirementText,
} from 'containers/student/StudentHome/utils';

import { apiGetAssignments } from 'api/assignment';
import shortenString from 'utils/helper/shortenString';
import tuple from 'utils/types/tuple';

export function StudentHome() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputTimer, setSearchInputTimer] = useState<NodeJS.Timeout>();

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('due_date');

  const hasFilter =
    !!searchQuery ||
    typeFilter !== '' ||
    statusFilter !== '' ||
    sortBy !== 'due_date';

  const onEditEssay = useCallback(
    (id: number) => {
      navigate(pathnames.assignmentEditSubmission(String(id)));
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setSearchInputTimer(undefined);
    setTypeFilter('');
    setStatusFilter('');
    setSortBy('due_date');
  }, []);

  const onTextFilterChange = useCallback(
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">My Assignments</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your assignments and track your progress
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card
        className="mb-6"
        title={
          <div className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter & Search Essays
          </div>
        }
      >
        <TextInput
          className="pl-10"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
          label="Search"
          onChange={e => onTextFilterChange(e.target.value)}
          value={searchInput}
        />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SelectInput
            emptyOption="Essay types"
            onChange={setTypeFilter}
            options={[
              { value: 'general', label: 'General' },
              { value: 'argumentative', label: 'Argumentative' },
              { value: 'narrative', label: 'Narrative' },
              { value: 'expository', label: 'Expository' },
              { value: 'descriptive', label: 'Descriptive' },
            ]}
            value={typeFilter}
          />
          <SelectInput
            emptyOption="Statuses"
            onChange={setStatusFilter}
            options={[
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'In Progress', value: 'in-progress' },
              { label: 'Completed', value: 'completed' },
              { label: 'Graded', value: 'graded' },
              { label: 'Past Due', value: 'past-due' },
            ]}
            value={statusFilter}
          />
          <SelectInput
            label="Sort by"
            onChange={setSortBy}
            options={[
              { label: 'Due Date', value: 'due_date' },
              { label: 'Title', value: 'title' },
              { label: 'Subject', value: 'subject' },
              { label: 'Status', value: 'status' },
            ]}
            value={sortBy}
          />

          <Button
            className="gap-2 w-full"
            onClick={clearFilters}
            variant="outline"
          >
            <SortAsc className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        {hasFilter && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge className="text-xs" variant="secondary">
                  Search: &quot;{searchQuery}&quot;
                </Badge>
              )}
              {typeFilter !== '' && (
                <Badge className="text-xs" variant="secondary">
                  Type: {typeFilter}
                </Badge>
              )}
              {statusFilter !== '' && (
                <Badge className="text-xs" variant="secondary">
                  Status: {getStatusText(statusFilter)}
                </Badge>
              )}
              {sortBy !== 'due_date' && (
                <Badge className="text-xs" variant="secondary">
                  Sort: {sortBy}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <InfiniteList
          emptyPlaceholder={
            hasFilter ? (
              <div className="text-center py-12 col-span-3">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No assignments match your filters
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find your
                  assignments
                </p>
                <Button
                  className="gap-2 inline-flex"
                  onClick={clearFilters}
                  variant="outline"
                >
                  <SortAsc className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 col-span-3">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-lg mb-2">
                  You are not assigned any assignments yet
                </div>
              </div>
            )
          }
          queryFn={apiGetAssignments}
          queryKey={tuple([
            apiGetAssignments.queryKey,
            {
              page: 1,
              limit: 10,
              filter: {
                search: searchQuery,
                type: typeFilter === '' ? undefined : typeFilter,
                status: statusFilter === '' ? undefined : statusFilter,
              },
              sort: sortBy,
            },
          ])}
          renderItem={assignment => (
            <Card
              badgeText={getBadgeText(assignment.type)}
              classes={{
                root: 'hover:shadow-md transition-shadow',
                status: getStatusClass(assignment.status),
              }}
              description={shortenString(assignment.description, 100)}
              footer={
                <Button
                  className="flex-1 gap-2 text-sm"
                  onClick={() => onEditEssay(assignment.id)}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 inline" />
                  {assignment.status === 'graded' ? 'View' : 'Edit'}
                </Button>
              }
              key={assignment.id}
              status={getStatusText(assignment.status)}
              title={assignment.title}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  {getWordRequirementText(assignment)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  Due: {dayjs(assignment.due_date).format('MMM D, YYYY')}
                </div>
              </div>
            </Card>
          )}
        />
      </div>
    </div>
  );
}

export default StudentHome;

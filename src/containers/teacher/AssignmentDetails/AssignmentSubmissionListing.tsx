import React, { useCallback, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { isNumber } from 'lodash-es';
import { Eye, Search } from 'lucide-react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { pathnames } from 'routes';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import Table from 'components/display/Table';
import Button from 'components/input/Button';
import TextInput from 'components/input/TextInput';

import {
  apiGetSubmisssionListing,
  apiGetSubmisssionRecentListing,
} from 'api/assignment';
import type {
  AssignmentRecentSubmissionListingItem,
  AssignmentSubmissionListingItem,
} from 'types/assignment';
import type { ListingResponse } from 'types/response';
import getUserName from 'utils/helper/getUserName';
import tuple from 'utils/types/tuple';

const getSubmissionItemStatus = (item: AssignmentSubmissionListingItem) => {
  if (item.submissions.some(submission => isNumber(submission.score)))
    return 'graded';
  if (
    item.submissions.some(
      submission => submission.stage_type === 'writing' && submission.is_final,
    )
  )
    return 'pending';
  return 'draft';
};

const getStatusBadge = (item: AssignmentSubmissionListingItem) => {
  const status = getSubmissionItemStatus(item);
  switch (status) {
    case 'graded':
      return <Badge className="bg-green-600">Graded</Badge>;
    case 'pending':
      return <Badge>Pending</Badge>;
    default:
      return <Badge variant="secondary">Draft</Badge>;
  }
};

type Props = {
  assignmentId?: number;
  isRecent?: boolean;
};

const AssignmentSubmissionListing = ({ assignmentId, isRecent }: Props) => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [queryKey, queryFn] = useMemo(() => {
    if (isRecent) {
      return [
        tuple([
          apiGetSubmisssionRecentListing.queryKey,
          { page, limit, filter: searchQuery },
        ]),
        apiGetSubmisssionRecentListing,
      ];
    }
    return [
      tuple([
        apiGetSubmisssionListing.queryKey,
        { assignment_id: assignmentId, page, limit, filter: searchQuery },
      ]),
      apiGetSubmisssionListing,
    ];
  }, [assignmentId, isRecent, limit, page, searchQuery]);

  const { data, isLoading, error } = useQuery(
    queryKey,
    queryFn as (
      context: any,
    ) => Promise<ListingResponse<AssignmentSubmissionListingItem>>,
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      setSearchTimer(
        setTimeout(() => {
          setSearchQuery(value);
          setPage(1);
        }, 500),
      );
    },
    [searchTimer],
  );

  const onViewSubmission = useCallback(
    (assignmentId: number, studentId: number) => {
      navigate(
        pathnames.submissionView(String(assignmentId), String(studentId)),
      );
    },
    [navigate],
  );

  const submissionRows = useMemo(() => {
    if (!data?.value.length) {
      return [];
    }
    return data.value.map(item => ({
      id: item.student.id,
      ...(isRecent
        ? {
            assignment: (item as AssignmentRecentSubmissionListingItem).title,
          }
        : {}),
      name: getUserName(item.student),
      status: getStatusBadge(item),
      last_submitted_at: dayjs(item.submissions[0].submitted_at).format(
        'MMM D, YYYY',
      ),
      action: (
        <Button
          className="inline-flex gap-1"
          onClick={() => onViewSubmission(item.assignment_id, item.student.id)}
          size="sm"
          variant="ghost"
        >
          <Eye className="h-3 w-3" />
          {getSubmissionItemStatus(item) === 'pending' ? 'Grade' : 'View'}
        </Button>
      ),
    }));
  }, [data, isRecent, onViewSubmission]);

  return (
    <>
      {/* <Card>
        <div>
          <h3 className="font-medium mb-3">Submission Progress</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Total Students
              </p>
              <p className="text-2xl font-medium">{assignment.totalStudents}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Submitted</p>
              <p className="text-2xl font-medium">{assignment.submitted}</p>
              <div className="mt-2 w-full bg-background rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${getProgressPercentage(assignment.submitted, assignment.totalStudents)}%`,
                  }}
                />
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Graded</p>
              <p className="text-2xl font-medium">{assignment.graded}</p>
              <div className="mt-2 w-full bg-background rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${getProgressPercentage(assignment.graded, assignment.submitted)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div> 
      </Card>*/}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div>{isRecent ? 'Recent Submissions' : 'Student Submissions'}</div>
            <div className="relative w-64">
              <TextInput
                className="pl-9"
                icon={<Search className=" h-4 w-4 text-muted-foreground" />}
                label="Search"
                onChange={e => handleSearchChange(e.target.value)}
                value={searchValue}
              />
            </div>
          </div>
        }
      >
        {isLoading ? (
          <Loading />
        ) : data ? (
          <Table
            className="min-h-[300px]"
            columns={[
              ...(isRecent ? [{ key: 'assignment', title: 'Assignment' }] : []),
              { key: 'name', title: 'Student' },
              { key: 'status', title: 'Status' },
              { key: 'submitted_at', title: 'Submitted Date' },
              { key: 'action', title: 'Action', align: 'right' },
            ]}
            count={data?.count || 0}
            limit={limit}
            onPageChange={page => setPage(page + 1)}
            onRowsPerPageChange={setLimit}
            page={page - 1}
            rows={submissionRows.slice((page - 1) * limit, page * limit)}
          />
        ) : (
          <ErrorComponent error={error || 'Failed to fetch submissions.'} />
        )}
      </Card>
    </>
  );
};

export default AssignmentSubmissionListing;

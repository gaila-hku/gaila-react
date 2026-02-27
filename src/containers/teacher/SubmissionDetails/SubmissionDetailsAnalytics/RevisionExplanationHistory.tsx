import React, { useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { capitalize } from 'lodash-es';
import { ArrowRight } from 'lucide-react';
import { useQuery } from 'react-query';

import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import Table from 'components/display/Table';

import { apiGetRevisionExplanationListing } from 'api/gpt';
import type { RevisionResult } from 'types/gpt';
import tuple from 'utils/types/tuple';

const REIVISION_EXPLANATION_PAGE_LIMIT = 10;

type Props = { studentId: number; assignmentId: number };

const RevisionExplanationHistory = ({ studentId, assignmentId }: Props) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(
    tuple([
      apiGetRevisionExplanationListing.queryKey,
      {
        page,
        limit: REIVISION_EXPLANATION_PAGE_LIMIT,
        student_id: studentId,
        assignment_id: assignmentId,
      },
    ]),
    apiGetRevisionExplanationListing,
  );

  const revisionExplanationRows = useMemo(() => {
    if (!data?.value) {
      return [];
    }
    return data.value.map(item => {
      const revisionResult = JSON.parse(
        item.gpt_log.gpt_answer,
      ) as RevisionResult;
      const revisionItem = revisionResult.revision_items.find(
        revItem => revItem.aspect_id === item.aspect_id,
      );
      return {
        id: item.id,
        time: dayjs(item.saved_at).format('MMM D, YYYY'),
        revision_result: revisionItem ? (
          <div className="max-h-[200px] overflow-y-auto">
            <h4 className="font-medium">{revisionItem.aspect_title}</h4>
            {/* {revisionItem.suggestions.map((chunk, index) => (
              <React.Fragment key={index}>
                <p className="text-xs text-rose-500">{chunk.current_text}</p>
                <div className="flex items-start gap-1">
                  <ArrowRight className="h-3 w-3 mt-[2px] shrink-0" />
                  <p className="text-xs text-green-500">{chunk.replace_text}</p>
                </div>
              </React.Fragment>
            ))} */}
            <div className="text-xs mt-2">{revisionItem.comment}</div>
            <div className="text-xs mt-2">{revisionItem.explanation}</div>
          </div>
        ) : (
          '-'
        ),
        agreement: capitalize(item.response_type),
        explanation: item.explanation || '-',
      };
    });
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return <ErrorComponent error={error || 'No data'} />;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table
          columns={[
            { key: 'time', title: 'Time', width: 140 },
            {
              key: 'revision_result',
              title: 'Revision Result',
            },
            { key: 'agreement', title: 'Agreement', width: 80 },
            { key: 'explanation', title: 'Explanation', width: 200 },
          ]}
          count={data.count}
          limit={REIVISION_EXPLANATION_PAGE_LIMIT}
          onPageChange={setPage}
          page={page}
          rows={revisionExplanationRows}
        />
      </div>
      <div className="pt-2 border-t">
        <p className="text-sm">
          <span className="text-muted-foreground">Showing:</span>{' '}
          <span className="font-medium">
            {data.value.length} of {data.count} prompts
          </span>
        </p>
      </div>
    </>
  );
};

export default RevisionExplanationHistory;

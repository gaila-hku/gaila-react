import React, { useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { isNumber, startCase } from 'lodash-es';
import { useQuery } from 'react-query';

import Badge from 'components/display/Badge';
import ErrorComponent from 'components/display/ErrorComponent';
import Loading from 'components/display/Loading';
import Table from 'components/display/Table';

import { apiGetAllGptPrompts } from 'api/gpt';
import tuple from 'utils/types/tuple';

const PROMPT_HISTORY_PAGE_LIMIT = 10;

const getPromptAspectLabel = (code: number) => {
  switch (code) {
    case 1:
      return 'Content Idea';
    case 2:
      return 'Structure Help';
    case 3:
      return 'Revision';
    case 4:
      return 'Langugae Help';
    case 5:
      return 'Rhetoric Help';
    case 6:
      return 'Error Correction';
    default:
      return '-';
  }
};

type Props = { studentId: number };

const PromptHistory = ({ studentId }: Props) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(
    tuple([
      apiGetAllGptPrompts.queryKey,
      { page, limit: PROMPT_HISTORY_PAGE_LIMIT, user_id: studentId },
    ]),
    apiGetAllGptPrompts,
  );

  const promptHistoryRows = useMemo(() => {
    if (!data?.value) {
      return [];
    }
    return data.value.map(item => ({
      time: dayjs(item.user_ask_time).format('MMM D, YYYY'),
      agent: startCase(item.tool_key),
      prompt: item.user_question,
      nature: isNumber(item.prompt_nature_category) ? (
        <Badge
          className="text-xs"
          variant={item.prompt_nature_category === 2 ? 'primary' : 'secondary'}
        >
          {item.prompt_nature_category === 2 ? 'Learning' : 'Performance'}
        </Badge>
      ) : (
        '-'
      ),
      aspect: isNumber(item.prompt_aspect_category) ? (
        <Badge className="text-xs" variant="secondary">
          {getPromptAspectLabel(item.prompt_aspect_category)}
        </Badge>
      ) : (
        '-'
      ),
    }));
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
            { key: 'time', title: 'Time' },
            { key: 'agent', title: 'Agent' },
            { key: 'prompt', title: 'Prompt' },
            { key: 'nature', title: 'Prompt Nature' },
            { key: 'aspect', title: 'Prompt Aspect' },
          ]}
          limit={PROMPT_HISTORY_PAGE_LIMIT}
          onPageChange={setPage}
          page={page}
          rows={promptHistoryRows}
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

export default PromptHistory;

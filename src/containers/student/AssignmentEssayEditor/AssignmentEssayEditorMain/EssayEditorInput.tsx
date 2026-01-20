import React, { useCallback, useEffect, useRef } from 'react';

import { useMutation } from 'react-query';

import TextInput from 'components/input/TextInput';

import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';
import useAssignmentSubmissionProvider from 'containers/student/AssignmentSubmissionEditorSwitcher/AssignmentSubmissionProvider/useAssignmentSubmissionProvider';

import { apiSaveTraceData } from 'api/trace-data';

type Props = {
  updateWordCountStatus?: (essay: string) => void;
  handleAutoSave?: (isFinal: boolean, isManual: boolean) => void;
  value: string;
  onChange: (x: string) => void;
  minHeight?: number;
  disabled?: boolean;
  disableAutoSave?: boolean;
};

const EssayEditorInput = ({
  updateWordCountStatus,
  handleAutoSave,
  value,
  onChange: inputOnChange,
  minHeight,
  disabled: inputDisabled,
  disableAutoSave,
}: Props) => {
  const { assignment } = useAssignmentSubmissionProvider();
  const { readonly, currentStage } = useAssignmentEssayEditorProvider();
  const { mutateAsync: saveTraceData } = useMutation(apiSaveTraceData);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      inputOnChange(e.target.value);
      updateWordCountStatus?.(e.target.value);
    },
    [inputOnChange, updateWordCountStatus],
  );

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (disableAutoSave || e.relatedTarget?.tagName === 'BUTTON') {
        return;
      }
      handleAutoSave?.(false, false);
    },
    [disableAutoSave, handleAutoSave],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!assignment || !currentStage) {
        return;
      }
      saveTraceData({
        assignment_id: assignment.id || null,
        stage_id: currentStage.id || null,
        action: 'PASTE_TEXT',
        content: JSON.stringify({
          pasted_text: e.clipboardData.getData('text/plain'),
        }),
      });
    },
    [assignment, currentStage, saveTraceData],
  );

  const isUnload = useRef(false);
  // Save before quitting page
  useEffect(() => {
    if (readonly || disableAutoSave) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      isUnload.current = true;
      handleAutoSave?.(false, false);
    };

    const handleVisibilityChange = () => {
      if (isUnload.current) {
        return;
      }
      handleAutoSave?.(false, false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [disableAutoSave, handleAutoSave, readonly]);

  return (
    <TextInput
      disabled={readonly || inputDisabled}
      multiline
      onBlur={onBlur}
      onChange={onChange}
      onPaste={onPaste}
      placeholder="Start writing your essay here..."
      sx={{
        '& .MuiInputBase-root': {
          padding: 1.5,
          borderRadius: 2,
          minHeight: minHeight,
          maxHeight: 'calc(100vh - 300px)',
          overflow: 'auto',
          alignItems: 'flex-start',
          fontSize: 16,
          resize: 'none',
        },
      }}
      value={value}
    />
  );
};

export default EssayEditorInput;

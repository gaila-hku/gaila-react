import React, { useCallback, useRef } from 'react';

import { useMutation } from 'react-query';

import TextInput from 'components/input/TextInput';

import useAssignmentEssayEditorProvider from 'containers/student/AssignmentEssayEditor/AssignmentEssayEditorProvider/useAssignmentEssayEditorProvider';

import { apiSaveTraceData } from 'api/trace-data';

type Props = {
  updateWordCountStatus?: () => void;
  handleAutoSave: (isFinal: boolean, isManual: boolean) => void;
  value: string;
  onChange: (x: string) => void;
  minHeight?: number;
  disabled?: boolean;
};

const EssayEditorInput = ({
  updateWordCountStatus,
  handleAutoSave,
  value,
  onChange: inputOnChange,
  minHeight,
  disabled: inputDisabled,
}: Props) => {
  const { readonly, assignment, currentStage } =
    useAssignmentEssayEditorProvider();
  const { mutateAsync: saveTraceData } = useMutation(apiSaveTraceData);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      inputOnChange(e.target.value);
      updateWordCountStatus?.();
    },
    [inputOnChange, updateWordCountStatus],
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
  // FIXME: recover this
  // Save before quitting page
  // useEffect(() => {
  //   if (readonly) {
  //     return;
  //   }

  //   const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  //     e.preventDefault();
  //     isUnload.current = true;
  //     handleSave(false, false);
  //   };

  //   const handleVisibilityChange = () => {
  //     if (isUnload.current) {
  //       return;
  //     }
  //     handleSave(false, false);
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [handleSave, readonly]);

  return (
    <TextInput
      disabled={readonly || inputDisabled}
      multiline
      onBlur={() => handleAutoSave(false, false)}
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

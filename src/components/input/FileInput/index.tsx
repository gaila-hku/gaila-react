/**
 *
 * FileInput
 *
 */
import React, { memo, useCallback, useState } from 'react';

import clsx from 'clsx';
import { Upload } from 'lucide-react';
import {
  type DropEvent,
  type FileRejection,
  useDropzone,
} from 'react-dropzone';

import ErrorMessage from 'components/display/ErrorMessage';
import Loading from 'components/display/Loading';
import Clickable from 'components/input/Clickable';

type SingleFileOnChange = (newFile: File) => void;
type MultipleFileOnChange = (newFile: File[]) => void;
type FileInputOptions = {
  permittedFileExtensions?: Record<string, string[]>;
  maxSize?: number;
};

export interface Props {
  value: File[] | File | null;
  onChange: SingleFileOnChange | MultipleFileOnChange | null;
  onUpload?: (newFile: File[]) => void;
  multiple?: boolean;
  loading?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  uploadError?: unknown;
  useBinaryKey?: boolean;
  extraInput?: React.ReactNode;
  block?: boolean;
  fileInputOptions?: FileInputOptions;
  showPreview?: boolean;
}

function FileInput({
  value,
  onChange,
  onUpload,
  loading = false,
  readonly = false,
  disabled = false,
  multiple = false,
  style,
  className,
  children,
  fileInputOptions = {},
  uploadError,
  useBinaryKey,
  extraInput,
  block,
  showPreview = true,
}: Props) {
  const [error, setError] = useState<FileRejection[]>();
  const { permittedFileExtensions, maxSize } = fileInputOptions;

  const onDropHandler = useCallback(
    async (
      acceptedFiles: File[],
      fileRejections: FileRejection[],
      _event: DropEvent,
    ) => {
      if (!onChange || disabled || readonly) {
        return;
      }
      const files = acceptedFiles;
      files.forEach(file => {
        if (useBinaryKey) {
          (file as any).useBinaryKey = true;
        }
      });

      if (multiple) {
        onChange(files as any);
      } else {
        onChange(files[0] as any);
      }
      if (onUpload) {
        onUpload(files);
      }
      setError(fileRejections);
    },
    [disabled, multiple, onChange, onUpload, readonly, useBinaryKey],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onDropHandler,
    noClick: true,
    multiple,
    disabled: disabled,
    accept: permittedFileExtensions,
    maxSize,
  });

  const fileArr = ((multiple === true || !value ? value : [value]) ||
    []) as File[];

  // if (readonly) {
  //   return (
  //     <>
  //       <FileDisplay fileArr={fileArr} />
  //       {children}
  //     </>
  //   );
  // }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={clsx([
          'relative',
          block && 'w-full p-6 border border-gray-200 rounded',
          loading && 'file-input__loading',
        ])}
        style={style}
      >
        <input {...getInputProps()} />
        {loading ? (
          <Loading />
        ) : (
          <Clickable onClick={open}>
            <div className="flex items-center justify-center">
              <Upload className="w-5 h-5" />
              <div className="inline-block px-2 text-sm">
                {multiple
                  ? 'Click or drop files here'
                  : 'Click or drop a file here'}
              </div>
              {extraInput}
            </div>
          </Clickable>
        )}
        {children}
        <div
          className={clsx([
            isDragActive ? 'flex' : 'hidden',
            'absolute inset-0 z-10 bg-[rgba(50,50,50,0.75)] items-center justify-center',
          ])}
        >
          <b className="block text-white text-center text-xl">
            {multiple ? 'Drop your files here' : 'Drop your file here'}
          </b>
        </div>
      </div>
      <ErrorMessage className="mt-1" error={uploadError} />
      {error?.map(e => (
        <ErrorMessage
          className="mt-1"
          error={`${e.file.name}: ${e.errors.map(s => s.message).join(', ')}`}
          key={e.file.name + e.file.lastModified}
        />
      ))}
      {showPreview && !!fileArr.length && (
        <div className="mt-2 p-4 bg-secondary rounded-lg">
          <p className="text-sm">
            Selected file: {fileArr.map(file => file.name)}
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(FileInput);

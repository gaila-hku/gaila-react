import React, { useCallback, useMemo, useState } from 'react';

import { Upload } from 'lucide-react';
import { useMutation } from 'react-query';

import Table from 'components/display/Table';
import Button from 'components/input/Button';
import FileInput from 'components/input/FileInput';

import { apiUploadUser } from 'api/user';
import type { UserUploadResult } from 'types/user';
import getUserName from 'utils/helper/getUserName';

const UserUploader = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UserUploadResult[]>([]);

  const { mutate: uploadUser, isLoading } = useMutation(apiUploadUser, {
    onSuccess: res => {
      setUploadResult(res);
    },
    onError: () => {},
  });

  const handleCsvUpload = useCallback(() => {
    if (!csvFile) {
      return;
    }
    setUploadResult([]);
    uploadUser({ file: csvFile });
  }, [csvFile, uploadUser]);

  const uploadResultRows = useMemo(() => {
    if (!uploadResult.length) {
      return [];
    }
    return uploadResult.map((row, index) => ({
      id: row.data.id || `error-${index}`,
      username: row.data.username,
      full_name:
        row.data.first_name || row.data.last_name ? getUserName(row.data) : '-',
      password: row.data.password,
      role: row.data.role,
      class: row.data.class || '-',
      result: row.message,
    }));
  }, [uploadResult]);

  return (
    <div>
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <p className="text-sm">CSV Format Requirements:</p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>
            First row should be headers: username, password, role, first_name,
            last_name, class
          </li>
          <li>
            Role should be either &quot;student&quot;, &quot;teacher&quot; or
            &quot;admin&quot;
          </li>
          <li>Username, password and role are required</li>
        </ul>
      </div>

      <FileInput
        block
        className="my-4"
        fileInputOptions={{
          permittedFileExtensions: { 'text/csv': ['csv'] },
        }}
        onChange={setCsvFile}
        value={csvFile}
      />

      <Button
        className="w-full gap-2"
        disabled={!csvFile}
        loading={isLoading}
        onClick={handleCsvUpload}
      >
        <Upload className="h-4 w-4" />
        Upload CSV
      </Button>

      {!!uploadResult.length && (
        <Table
          columns={[
            { key: 'username', title: 'Username' },
            { key: 'full_name', title: 'Full Name' },
            { key: 'password', title: 'Password' },
            { key: 'role', title: 'Role' },
            { key: 'class', title: 'Class' },
            { key: 'result', title: 'Result' },
          ]}
          limit={uploadResult.length}
          onPageChange={() => {}}
          page={1}
          rows={uploadResultRows}
        />
      )}
    </div>
  );
};

export default UserUploader;

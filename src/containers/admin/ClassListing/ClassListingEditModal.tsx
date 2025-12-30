import React, { useCallback, useEffect, useRef, useState } from 'react';

import Modal from '@mui/material/Modal';
import clsx from 'clsx';
import { Check, UserMinus, Users, X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';

import Divider from 'components/display/Divider';
import ErrorComponent from 'components/display/ErrorComponent';
import useInfiniteListing from 'components/display/InfiniteList/useInfiniteListing';
import Label from 'components/display/Label';
import Loading from 'components/display/Loading';
import Popover from 'components/display/Popover';
import Command, { CommandItem } from 'components/display/Popover/Command';
import Button from 'components/input/Button';
import Clickable from 'components/input/Clickable';
import TextInput from 'components/input/TextInput';

import useAlert from 'containers/common/AlertProvider/useAlert';

import { apiGetAssignments } from 'api/assignment';
import { apiGetAllClasses, apiGetClasses, apiUpdateClass } from 'api/class';
import { apiGetClassOptions, apiGetUserListing } from 'api/user';
import type { ClassManagementDetail } from 'types/class';
import type { User } from 'types/user';
import getUserName from 'utils/helper/getUserName';
import tuple from 'utils/types/tuple';

type Props = {
  classItem: ClassManagementDetail | null;
  setClassItem: React.Dispatch<
    React.SetStateAction<ClassManagementDetail | null>
  >;
};

const defaultClassValue = {
  name: '',
  class_key: '',
  description: '',
  students: [],
  teachers: [],
};

const ClassListingEditModal = ({ classItem, setClassItem }: Props) => {
  const { alertMsg, errorMsg } = useAlert();
  const queryClient = useQueryClient();

  const { mutate: updateClass, isLoading: isUpdateLoading } = useMutation(
    apiUpdateClass,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([apiGetAllClasses.queryKey]);
        queryClient.invalidateQueries([apiGetClasses.queryKey]);
        queryClient.invalidateQueries([apiGetClassOptions.queryKey]);
        queryClient.invalidateQueries([apiGetAssignments.queryKey]);
        setClassItem(null);
        alertMsg('Class updated');
      },
      onError: e => {
        errorMsg(e);
      },
    },
  );

  const [classValue, setClassValue] =
    useState<Omit<ClassManagementDetail, 'id'>>(defaultClassValue);

  // Init classValue
  useEffect(() => {
    if (classItem) {
      setClassValue({
        name: classItem.name,
        class_key: classItem.class_key,
        description: classItem.description,
        students: classItem.students,
        teachers: classItem.teachers,
      });
    }
  }, [classItem]);

  const [openFlag, setOpenFlag] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputTimer, setSearchInputTimer] = useState<NodeJS.Timeout>();
  const endDiv = useRef<HTMLDivElement>(null);
  const {
    data: availableUsers,
    isLoading: isUserListLoading,
    endReached,
    setPages,
    setPageLimit,
    error,
  } = useInfiniteListing<User>({
    queryFn: apiGetUserListing,
    queryKey: tuple([apiGetUserListing.queryKey, { filter: searchQuery }]),
    queryOption: { enabled: openFlag },
    pageLimit: 3,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isUserListLoading) {
        setPageLimit(limit => (limit ?? 3) + 5);
        setPages(prev => prev + 1);
      }
    });
    const endDivEle = endDiv.current;
    if (endDivEle) {
      observer.observe(endDivEle);
    }
    return () => {
      if (endDivEle) {
        observer.unobserve(endDivEle);
      }
    };
  }, [setPageLimit, setPages, isUserListLoading, openFlag, availableUsers]);

  const handleUserSearchChange = useCallback(
    (search: string) => {
      if (searchInputTimer) {
        clearTimeout(searchInputTimer);
      }
      setSearchInputTimer(
        setTimeout(() => {
          setSearchQuery(search);
        }, 500),
      );
    },
    [searchInputTimer],
  );

  const handleClose = useCallback(() => {
    setClassValue(defaultClassValue);
    setClassItem(null);
  }, [setClassItem]);

  const handleAddUser = useCallback((user: User) => {
    if (user.role === 'student') {
      setClassValue(prev => ({
        ...prev,
        students: [...prev.students, user],
      }));
    } else if (user.role === 'teacher' || user.role === 'admin') {
      setClassValue(prev => ({
        ...prev,
        teachers: [...prev.teachers, user],
      }));
    }
  }, []);

  const handleRemoveTeacher = useCallback((teacherId: number) => {
    setClassValue(prev => ({
      ...prev,
      teachers: prev.teachers.filter(teacher => teacher.id !== teacherId),
    }));
  }, []);

  const handleRemoveStudent = useCallback((studentId: number) => {
    setClassValue(prev => ({
      ...prev,
      students: prev.students.filter(student => student.id !== studentId),
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!classItem) {
      return;
    }
    updateClass({
      id: classItem.id,
      name: classValue.name,
      class_key: classValue.class_key,
      description: classValue.description,
      students: classValue.students.map(student => student.id),
      teachers: classValue.teachers.map(teacher => teacher.id),
    });
  }, [classItem, updateClass, classValue]);

  return (
    <Modal onClose={handleClose} open={!!classItem}>
      <div
        className={clsx(
          'absolute top-1/2 left-1/2 -translate-1/2 w-[600px]',
          'bg-white p-4 rounded-lg flex flex-col gap-4',
        )}
      >
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="text-lg leading-none font-semibold">Edit Class</div>
            <div className="text-muted-foreground text-sm">
              Update class information and enrollments
            </div>
          </div>
          <Clickable onClick={handleClose}>
            <X />
          </Clickable>
        </div>
        <div className="space-y-4 pb-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <TextInput
              id="name"
              onChange={e =>
                setClassValue({ ...classValue, name: e.target.value })
              }
              placeholder="Class name"
              value={classValue.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class_key">Class Key</Label>
            <TextInput
              id="class_key"
              onChange={e =>
                setClassValue({ ...classValue, class_key: e.target.value })
              }
              placeholder="Key"
              value={classValue.class_key}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <TextInput
              id="description"
              onChange={e =>
                setClassValue({ ...classValue, description: e.target.value })
              }
              placeholder="Description"
              value={classValue.description}
            />
          </div>
          <Divider />
          <div className="text-md leading-none font-medium">Enrollments</div>
          <Popover
            buttonText={
              <>
                <Users className="h-4 w-4" />
                Add Users
              </>
            }
            childClass="w-[300px] p-0"
            onClickButton={() => setOpenFlag(true)}
            onClosePopover={() => setOpenFlag(false)}
          >
            <Command
              emptyPlaceholder="No users found."
              includeSearch
              onSearchChange={handleUserSearchChange}
              searchPlaceholder="Search users..."
              shouldFilter={false}
            >
              {error ? <ErrorComponent error={error} /> : null}
              {availableUsers?.map(user => {
                const isClassAdded =
                  classValue.students.some(c => c.id === user.id) ||
                  classValue.teachers.some(c => c.id === user.id);
                return (
                  <CommandItem
                    disabled={isClassAdded}
                    key={user.id}
                    onSelect={() => handleAddUser(user)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {isClassAdded && <Check className="h-4 w-4" />}
                        <div>
                          <p className="text-sm">{getUserName(user, true)}</p>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
              {isUserListLoading && <Loading className="mx-auto" />}
              {!!availableUsers?.length && !endReached && <div ref={endDiv} />}
            </Command>
          </Popover>
          <div>
            <Label className="mb-2" htmlFor="name">
              Teachers ({classValue.teachers.length})
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {classValue.teachers.length > 0 ? (
                classValue.teachers.map(teacher => (
                  <div
                    className="p-2 border rounded transition-colors flex justify-between items-center"
                    key={teacher.id}
                  >
                    <p className="text-sm">{getUserName(teacher, true)}</p>
                    <Button
                      className="!h-6"
                      onClick={() => handleRemoveTeacher(teacher.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-muted-foreground py-4">
                  No teachers found
                </div>
              )}
            </div>
          </div>
          <div>
            <Label className="mb-2" htmlFor="name">
              Students ({classValue.students.length})
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {classValue.students.length > 0 ? (
                classValue.students.map(student => (
                  <div
                    className="p-2 border rounded transition-colors flex justify-between items-center"
                    key={student.id}
                  >
                    <p className="text-sm">{getUserName(student, true)}</p>
                    <Button
                      className="!h-6"
                      onClick={() => handleRemoveStudent(student.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-muted-foreground py-4">
                  No students found
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          loading={isUpdateLoading}
          onClick={handleSubmit}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default ClassListingEditModal;

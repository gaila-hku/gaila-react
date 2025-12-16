import type { User } from 'types/user';

const getUserName = (user: Partial<User>) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.first_name) {
    return user.first_name;
  }
  return user.username || '';
};

export default getUserName;

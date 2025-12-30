import type { User } from 'types/user';

const getUserName = (user: Partial<User>, withUserName?: boolean) => {
  if (user.first_name && user.last_name) {
    if (withUserName && user.username) {
      return `${user.first_name} ${user.last_name} (${user.username})`;
    }
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.first_name) {
    if (withUserName && user.username) {
      return `${user.first_name} (${user.username})`;
    }
    return user.first_name;
  }
  return user.username || '';
};

export default getUserName;

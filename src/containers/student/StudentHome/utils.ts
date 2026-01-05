import type {
  AssignmentDetails,
  StudentAssignmentListingItem,
  TeacherAssignmentListingItem,
} from 'types/assignment';

export const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'graded':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'Upcoming';
    case 'in-progress':
      return 'In Progress';
    case 'submitted':
      return 'Submitted';
    case 'graded':
      return 'Graded';
    case 'past-due':
      return 'Past Due';
    default:
      return 'All';
  }
};

export const getBadgeText = (type: AssignmentDetails['type']) => {
  switch (type) {
    case 'argumentative':
      return 'Argumentative';
    case 'narrative':
      return 'Narrative';
    case 'expository':
      return 'Expository';
    case 'descriptive':
      return 'Descriptive';
    default:
      return 'General';
  }
};

export const getWordRequirementText = (
  assignment: StudentAssignmentListingItem | TeacherAssignmentListingItem,
) => {
  if (
    assignment.requirements?.min_word_count &&
    assignment.requirements.max_word_count
  ) {
    return `${assignment.requirements.min_word_count} - ${assignment.requirements.max_word_count} words`;
  }
  if (assignment.requirements?.min_word_count) {
    return `>${assignment.requirements.min_word_count} words`;
  }
  if (assignment.requirements?.max_word_count) {
    return `<${assignment.requirements.max_word_count} words`;
  }
  return 'No word requirement';
};

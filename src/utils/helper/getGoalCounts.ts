import type { AssignmentGoalContent } from 'types/assignment';

const getGoalCounts = (goals: AssignmentGoalContent | null) => {
  if (!goals) {
    return [0, 0];
  }
  const allGoals = [...goals.writing_goals, ...goals.ai_goals];
  const completedCounts = allGoals.reduce(
    (acc, g) => acc + g.strategies.filter(s => s.completed).length,
    0,
  );
  const totalCounts = allGoals.reduce((acc, g) => acc + g.strategies.length, 0);
  return [completedCounts, totalCounts];
};

export default getGoalCounts;

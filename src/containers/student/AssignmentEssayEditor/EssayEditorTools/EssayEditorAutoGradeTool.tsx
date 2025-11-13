import React, { useState } from 'react';

import { Bot, Sparkles } from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';

import useAlert from 'containers/common/AlertProvider/useAlert';

interface AutoGradeResult {
  overallScore: number;
  totalPoints: number;
  criteriaScores: {
    criteria: string;
    score: number;
    maxPoints: number;
    feedback: string;
  }[];
  overallFeedback: string;
}

type Props = {
  getEssayContent: () => string;
};

const EssayEditorAutoGradeTool = ({ getEssayContent }: Props) => {
  const { errorMsg } = useAlert();
  // Checklist state

  // Auto grading state
  const [autoGradeResult, setAutoGradeResult] =
    useState<AutoGradeResult | null>(null);
  const [isAutoGrading, setIsAutoGrading] = useState(false);

  const handleAutoGrade = () => {
    const essayContent = getEssayContent();

    if (!essayContent.trim()) {
      errorMsg('Essay is empty');
      return;
    }

    setIsAutoGrading(true);

    // Simulate AI grading
    setTimeout(() => {
      const mockGradeResult: AutoGradeResult = {
        overallScore: 81,
        totalPoints: 100,
        criteriaScores: [
          {
            criteria: 'Thesis and Argument',
            score: 21,
            maxPoints: 25,
            feedback:
              'Strong thesis statement that clearly addresses the prompt. Arguments are well-structured and logical. Consider adding more nuanced counterarguments to strengthen your position.',
          },
          {
            criteria: 'Evidence and Sources',
            score: 19,
            maxPoints: 25,
            feedback:
              'Good use of examples and evidence. However, the essay lacks proper citations. Remember to include at least 5 credible sources with proper MLA formatting to meet requirements.',
          },
          {
            criteria: 'Organization and Structure',
            score: 17,
            maxPoints: 20,
            feedback:
              'Excellent paragraph structure with clear topic sentences. Smooth transitions between ideas. The conclusion could be stronger by providing more concrete calls to action.',
          },
          {
            criteria: 'Writing Quality',
            score: 16,
            maxPoints: 20,
            feedback:
              'Clear and engaging writing style. Good vocabulary usage. Watch for passive voice in some sentences. Vary sentence structure more for better flow.',
          },
          {
            criteria: 'Citations and Format',
            score: 8,
            maxPoints: 10,
            feedback:
              'Format is appropriate but missing in-text citations and a works cited page. Ensure all sources are properly documented in MLA format.',
          },
        ],
        overallFeedback:
          'This is a solid essay with a clear argument and good organization. Your main strengths are the logical structure and engaging writing style. To improve, focus on adding proper citations for all claims, incorporating more scholarly sources, and developing the conclusion with specific actionable recommendations. The essay demonstrates good understanding of the topic but needs more academic rigor in terms of evidence and documentation.',
      };

      setAutoGradeResult(mockGradeResult);
      setIsAutoGrading(false);
    }, 2500);
  };

  return (
    <Card
      classes={{
        title: 'flex items-center gap-2 text-base',
        children: 'space-y-3',
        root: '!p-4',
      }}
      title={
        <>
          <Sparkles className="h-4 w-4" /> AI Auto Grading
        </>
      }
    >
      <Button
        className="w-full gap-2"
        disabled={isAutoGrading}
        onClick={handleAutoGrade}
        size="sm"
      >
        <Sparkles className="h-4 w-4" />
        {isAutoGrading ? 'Grading...' : 'Grade My Essay'}
      </Button>

      {autoGradeResult && (
        <div className="max-h-[400px] overflow-auto">
          <div className="space-y-3 pr-4">
            {/* Overall Score */}
            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Overall Score
                </p>
                <p className="text-2xl font-bold text-primary">
                  {autoGradeResult.overallScore}
                  <span className="text-sm">
                    /{autoGradeResult.totalPoints}
                  </span>
                </p>
                <Badge
                  className="mt-2 text-xs"
                  variant={
                    autoGradeResult.overallScore >= 80
                      ? 'primary'
                      : autoGradeResult.overallScore >= 60
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {autoGradeResult.overallScore >= 80
                    ? 'Excellent'
                    : autoGradeResult.overallScore >= 60
                      ? 'Good'
                      : 'Needs Improvement'}
                </Badge>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold">Score Breakdown</h4>
              {autoGradeResult.criteriaScores.map((criterion, idx) => (
                <div
                  className="p-2 border rounded text-xs space-y-1.5"
                  key={idx}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{criterion.criteria}</span>
                    <Badge className="text-xs" variant="outline">
                      {criterion.score}/{criterion.maxPoints}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {criterion.feedback}
                  </p>
                </div>
              ))}
            </div>

            {/* Overall Feedback */}
            <div className="p-2 bg-secondary rounded text-xs">
              <h4 className="font-semibold mb-1.5 flex items-center gap-1">
                <Bot className="h-3 w-3" />
                Overall Feedback
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {autoGradeResult.overallFeedback}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EssayEditorAutoGradeTool;

import React, { useState } from 'react';

import {
  CheckCircle,
  ClipboardList,
  FileCheck,
  GraduationCap,
  Shield,
} from 'lucide-react';

import Badge from 'components/display/Badge';
import Card from 'components/display/Card';
import Button from 'components/input/Button';

interface ChecklistResult {
  type: 'grammar' | 'originality' | 'academic' | 'organization';
  score: number;
  issues: { description: string; severity: 'low' | 'medium' | 'high' }[];
}

const EssayEditorGrammarTool = () => {
  const [checklistResults, setChecklistResults] = useState<ChecklistResult[]>(
    [],
  );
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [isCheckingOriginality, setIsCheckingOriginality] = useState(false);
  const [isCheckingAcademic, setIsCheckingAcademic] = useState(false);
  const [isCheckingOrganization, setIsCheckingOrganization] = useState(false);

  // Checklist functions
  const handleCheckGrammar = () => {
    setIsCheckingGrammar(true);
    setTimeout(() => {
      const result: ChecklistResult = {
        type: 'grammar',
        score: 87,
        issues: [
          {
            description:
              "Consider using 'have caused' instead of 'are causing' for consistency",
            severity: 'low',
          },
          {
            description:
              "The phrase 'more frequent and severe' could be 'increasingly frequent and severe'",
            severity: 'low',
          },
          {
            description:
              'Missing comma after introductory phrase in paragraph 2',
            severity: 'medium',
          },
        ],
      };
      setChecklistResults(prev => [
        ...prev.filter(r => r.type !== 'grammar'),
        result,
      ]);
      setIsCheckingGrammar(false);
    }, 1500);
  };

  const handleCheckOriginality = () => {
    setIsCheckingOriginality(true);
    setTimeout(() => {
      const result: ChecklistResult = {
        type: 'originality',
        score: 76,
        issues: [
          {
            description:
              'First paragraph shows 24% similarity to common sources',
            severity: 'high',
          },
          {
            description:
              'Some phrases are commonly used in climate change essays',
            severity: 'medium',
          },
          {
            description: 'Consider paraphrasing to improve originality',
            severity: 'medium',
          },
        ],
      };
      setChecklistResults(prev => [
        ...prev.filter(r => r.type !== 'originality'),
        result,
      ]);
      setIsCheckingOriginality(false);
    }, 2000);
  };

  const handleCheckAcademic = () => {
    setIsCheckingAcademic(true);
    setTimeout(() => {
      const result: ChecklistResult = {
        type: 'academic',
        score: 82,
        issues: [
          {
            description: "Use more formal language instead of 'we see'",
            severity: 'medium',
          },
          {
            description: 'Add more citations to support claims',
            severity: 'high',
          },
          {
            description: 'Consider using more discipline-specific terminology',
            severity: 'low',
          },
        ],
      };
      setChecklistResults(prev => [
        ...prev.filter(r => r.type !== 'academic'),
        result,
      ]);
      setIsCheckingAcademic(false);
    }, 1500);
  };

  const handleCheckOrganization = () => {
    setIsCheckingOrganization(true);
    setTimeout(() => {
      const result: ChecklistResult = {
        type: 'organization',
        score: 91,
        issues: [
          { description: 'Strong thesis statement present', severity: 'low' },
          { description: 'Good paragraph transitions', severity: 'low' },
          {
            description: 'Consider adding a counterargument section',
            severity: 'medium',
          },
        ],
      };
      setChecklistResults(prev => [
        ...prev.filter(r => r.type !== 'organization'),
        result,
      ]);
      setIsCheckingOrganization(false);
    }, 1500);
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
          <ClipboardList className="h-4 w-4" /> Checklist
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <Button
          className="gap-1 h-auto py-2 flex-col text-xs"
          disabled={isCheckingGrammar}
          onClick={handleCheckGrammar}
          size="sm"
          variant="outline"
        >
          <CheckCircle className="h-3 w-3" />
          Grammar
        </Button>

        <Button
          className="gap-1 h-auto py-2 flex-col text-xs"
          disabled={isCheckingOriginality}
          onClick={handleCheckOriginality}
          size="sm"
          variant="outline"
        >
          <Shield className="h-3 w-3" />
          Originality
        </Button>

        <Button
          className="gap-1 h-auto py-2 flex-col text-xs"
          disabled={isCheckingAcademic}
          onClick={handleCheckAcademic}
          size="sm"
          variant="outline"
        >
          <GraduationCap className="h-3 w-3" />
          Academic
        </Button>

        <Button
          className="gap-1 h-auto py-2 flex-col text-xs"
          disabled={isCheckingOrganization}
          onClick={handleCheckOrganization}
          size="sm"
          variant="outline"
        >
          <FileCheck className="h-3 w-3" />
          Organization
        </Button>
      </div>

      {checklistResults.length > 0 && (
        <div className="max-h-[300px] overflow-auto">
          <div className="space-y-2 pr-4">
            {checklistResults.map(result => (
              <div
                className="p-2 border rounded text-xs space-y-1.5"
                key={result.type}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">{result.type}</h4>
                  <Badge
                    className="text-xs"
                    variant={
                      result.score >= 80
                        ? 'primary'
                        : result.score >= 60
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {result.score}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  {result.issues.slice(0, 3).map((issue, idx) => (
                    <div className="flex items-start gap-1.5" key={idx}>
                      <span
                        className={`mt-0.5 ${
                          issue.severity === 'high'
                            ? 'text-red-500'
                            : issue.severity === 'medium'
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                        }`}
                      >
                        •
                      </span>
                      <span className="text-muted-foreground leading-tight">
                        {issue.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EssayEditorGrammarTool;

import React from 'react';

import { Edit, School } from 'lucide-react';

import Card from 'components/display/Card';
import Button from 'components/input/Button';

import type { ClassManagementDetail } from 'types/class';

type Props = {
  classItem: ClassManagementDetail;
  setEditingClass: React.Dispatch<
    React.SetStateAction<ClassManagementDetail | null>
  >;
};

const ClassCard = ({ classItem, setEditingClass }: Props) => {
  return (
    <Card className="h-fit">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg leading-none">{classItem.name}</h3>
            <div className="text-sm text-muted-foreground">
              {classItem.description}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={() => setEditingClass(classItem)}
            size="sm"
            variant="ghost"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ClassCard;

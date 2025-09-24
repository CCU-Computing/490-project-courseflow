
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Label } from "@/components/ui/label";

export type Semester = "Fall" | "Spring" | "Summer";

export type SemesterFilterSelection = {
  all: boolean;
  semesters: Semester[];
};

type Props = {
  /** Called whenever the selection changes */
  onFilterChange: (selection: SemesterFilterSelection) => void;
  /** Optional controlled value */
  value?: SemesterFilterSelection;
  className?: string;
};

const ALL_SEMESTERS: Semester[] = ["Fall", "Spring", "Summer"];

export default function SemesterFilter({ onFilterChange, value, className }: Props) {
  // Default to "All" selected
  const [sel, setSel] = React.useState<SemesterFilterSelection>(
    value ?? { all: true, semesters: [...ALL_SEMESTERS] }
  );

  
  React.useEffect(() => {
    if (value) setSel(value);
  }, [value]);

  const emit = (next: SemesterFilterSelection) => {
    setSel(next);
    onFilterChange(next);
  };

  const handleAllChange = (checked: boolean) => {
    emit(checked ? { all: true, semesters: [...ALL_SEMESTERS] } : { all: false, semesters: [] });
  };

  const handleOneChange = (sem: Semester, checked: boolean) => {
    const s = new Set(sel.semesters);
    checked ? s.add(sem) : s.delete(sem);
    const list = Array.from(s) as Semester[];
    const isAll = list.length === ALL_SEMESTERS.length;
    emit({ all: isAll, semesters: isAll ? [...ALL_SEMESTERS] : list });
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Checkbox
          id="semester-all"
          checked={sel.all}
          onCheckedChange={(c) => handleAllChange(Boolean(c))}
        />
        <Label htmlFor="semester-all">All</Label>
      </div>

      {ALL_SEMESTERS.map((sem) => (
        <div key={sem} className="flex items-center gap-2 mb-1">
          <Checkbox
            id={`semester-${sem}`}
            checked={sel.semesters.includes(sem)}
            onCheckedChange={(c) => handleOneChange(sem, Boolean(c))}
            disabled={sel.all} 
          />
          <Label htmlFor={`semester-${sem}`}>{sem}</Label>
        </div>
      ))}
    </div>
  );
}

interface RelationBadgeProps {
  total: number;
}

function getRelation(total: number): { label: string; grade: string; color: string } {
  if (total === 0) return { label: "Neutral", grade: "", color: "bg-muted text-muted-foreground" };

  const abs = Math.abs(total);
  let grade: string;
  if (abs >= 101) grade = "A+";
  else if (abs >= 51) grade = "A";
  else if (abs >= 11) grade = "B";
  else grade = "C";

  if (total > 0) {
    return { label: "Friend", grade, color: "bg-success/20 text-success" };
  }
  return { label: "Enemy", grade, color: "bg-destructive/20 text-destructive" };
}

const RelationBadge = ({ total }: RelationBadgeProps) => {
  const { label, grade, color } = getRelation(total);

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {label}{grade && ` (${grade})`}
    </span>
  );
};

export default RelationBadge;

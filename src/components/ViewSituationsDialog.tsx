import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Trash2 } from "lucide-react";

interface Situation {
  id: string;
  description: string;
  marks: number;
  type: string;
  created_at: string;
}

interface Props {
  personId: string;
  personName: string;
  type: "positive" | "negative";
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

const ViewSituationsDialog = ({ personId, personName, type, open, onClose, onChanged }: Props) => {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSituations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("situations")
      .select("*")
      .eq("person_id", personId)
      .eq("type", type)
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load situations");
    else setSituations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchSituations();
  }, [open]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("situations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setSituations((prev) => prev.filter((s) => s.id !== id));
      onChanged();
    }
  };

  if (!open) return null;

  const label = type === "positive" ? "Positive" : "Negative";
  const markColor = type === "positive" ? "text-success" : "text-destructive";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {label} Situations — {personName}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : situations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No {type} situations yet.</p>
          ) : (
            situations.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{s.description}</p>
                  <p className={`text-xs font-semibold mt-1 ${markColor}`}>
                    Marks: {s.marks}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSituationsDialog;

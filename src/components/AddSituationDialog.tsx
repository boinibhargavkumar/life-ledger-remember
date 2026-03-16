import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  personId: string;
  personName: string;
  type: "positive" | "negative";
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const AddSituationDialog = ({ personId, personName, type, open, onClose, onAdded }: Props) => {
  const [description, setDescription] = useState("");
  const [marks, setMarks] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDesc = description.trim();
    const marksNum = parseInt(marks, 10);

    if (!trimmedDesc || trimmedDesc.length > 500) {
      toast.error("Description must be 1-500 characters");
      return;
    }
    if (isNaN(marksNum) || marksNum < 1 || marksNum > 100) {
      toast.error("Marks must be between 1 and 100");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not authenticated"); setLoading(false); return; }

    const { error } = await supabase.from("situations").insert({
      person_id: personId,
      user_id: user.id,
      type,
      description: trimmedDesc,
      marks: marksNum,
    });

    setLoading(false);
    if (error) {
      toast.error("Failed to add situation");
    } else {
      toast.success("Situation added");
      setDescription("");
      setMarks("");
      onAdded();
      onClose();
    }
  };

  const label = type === "positive" ? "Positive" : "Negative";
  const accent = type === "positive" ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Add {label} Situation — {personName}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="What happened?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Marks (1-100)</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              min={1}
              max={100}
              className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter marks"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${accent}`}
          >
            {loading ? "Adding..." : `Add ${label} Situation`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSituationDialog;

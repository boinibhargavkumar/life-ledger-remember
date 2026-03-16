import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { LogOut, Plus, Eye, Trash2, UserPlus } from "lucide-react";
import RelationBadge from "@/components/RelationBadge";
import AddSituationDialog from "@/components/AddSituationDialog";
import ViewSituationsDialog from "@/components/ViewSituationsDialog";

interface Person {
  id: string;
  name: string;
  positive_count: number;
  positive_marks: number;
  negative_count: number;
  negative_marks: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [persons, setPersons] = useState<Person[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingPerson, setAddingPerson] = useState(false);

  // Dialog state
  const [addDialog, setAddDialog] = useState<{ personId: string; personName: string; type: "positive" | "negative" } | null>(null);
  const [viewDialog, setViewDialog] = useState<{ personId: string; personName: string; type: "positive" | "negative" } | null>(null);

  const fetchPersons = useCallback(async () => {
    if (!user) return;
    const { data: personsData, error: pErr } = await supabase
      .from("persons")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (pErr) { toast.error("Failed to load persons"); return; }

    const { data: situationsData, error: sErr } = await supabase
      .from("situations")
      .select("person_id, type, marks");

    if (sErr) { toast.error("Failed to load situations"); return; }

    const mapped: Person[] = (personsData || []).map((p) => {
      const sits = (situationsData || []).filter((s) => s.person_id === p.id);
      const pos = sits.filter((s) => s.type === "positive");
      const neg = sits.filter((s) => s.type === "negative");
      return {
        id: p.id,
        name: p.name,
        positive_count: pos.length,
        positive_marks: pos.reduce((sum, s) => sum + Number(s.marks), 0),
        negative_count: neg.length,
        negative_marks: neg.reduce((sum, s) => sum + Number(s.marks), 0),
      };
    });

    setPersons(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPersons(); }, [fetchPersons]);

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed || trimmed.length > 100) {
      toast.error("Name must be 1-100 characters");
      return;
    }
    if (!user) return;
    setAddingPerson(true);
    const { error } = await supabase.from("persons").insert({ user_id: user.id, name: trimmed });
    setAddingPerson(false);
    if (error) toast.error("Failed to add person");
    else { setNewName(""); fetchPersons(); }
  };

  const handleDeletePerson = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all their situations?`)) return;
    const { error } = await supabase.from("persons").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else fetchPersons();
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not authenticated"); return; }
      const res = await supabase.functions.invoke("delete-account");
      if (res.error) throw res.error;
      await supabase.auth.signOut();
      toast.success("Account deleted");
    } catch {
      toast.error("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Life Ledger</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Add Person */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Relationships</h2>
          <form onSubmit={handleAddPerson} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Person name"
              maxLength={100}
              className="flex-1 rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={addingPerson}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Add Person
            </button>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : persons.length === 0 ? (
          <p className="text-muted-foreground">No relationships yet. Add a person above to get started.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-4 py-3 text-left font-semibold text-primary">Person Name</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Positive Situations</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Marks+</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Negative Situations</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Marks−</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Final Relation</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {persons.map((p) => {
                  const total = p.positive_marks - p.negative_marks;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-foreground">{p.positive_count}</span>
                          <button
                            onClick={() => setAddDialog({ personId: p.id, personName: p.name, type: "positive" })}
                            className="rounded p-1 text-success hover:bg-success/20 transition-colors"
                            title="Add positive"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setViewDialog({ personId: p.id, personName: p.name, type: "positive" })}
                            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="View positive"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-success">{p.positive_marks}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-foreground">{p.negative_count}</span>
                          <button
                            onClick={() => setAddDialog({ personId: p.id, personName: p.name, type: "negative" })}
                            className="rounded p-1 text-destructive hover:bg-destructive/20 transition-colors"
                            title="Add negative"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setViewDialog({ personId: p.id, personName: p.name, type: "negative" })}
                            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="View negative"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-destructive">{p.negative_marks}</td>
                      <td className="px-4 py-3 text-center font-bold text-foreground">{total}</td>
                      <td className="px-4 py-3 text-center">
                        <RelationBadge total={total} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeletePerson(p.id, p.name)}
                          className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete person"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Account */}
        <div className="mt-12 pt-8 border-t border-border">
          <button
            onClick={handleDeleteAccount}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </main>

      {/* Dialogs */}
      {addDialog && (
        <AddSituationDialog
          personId={addDialog.personId}
          personName={addDialog.personName}
          type={addDialog.type}
          open={true}
          onClose={() => setAddDialog(null)}
          onAdded={fetchPersons}
        />
      )}
      {viewDialog && (
        <ViewSituationsDialog
          personId={viewDialog.personId}
          personName={viewDialog.personName}
          type={viewDialog.type}
          open={true}
          onClose={() => setViewDialog(null)}
          onChanged={fetchPersons}
        />
      )}
    </div>
  );
};

export default Dashboard;

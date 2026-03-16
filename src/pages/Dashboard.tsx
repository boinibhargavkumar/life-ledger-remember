import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Life Ledger</h1>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
        </h2>
        <p className="mt-2 text-muted-foreground">
          You're signed in as <strong className="text-foreground">{user?.email}</strong>.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;

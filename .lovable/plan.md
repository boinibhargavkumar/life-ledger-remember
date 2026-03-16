

# Plan: Build Life Ledger Relationship Tracking Page

## Overview
Re-implement the relationship tracking dashboard as shown in the screenshot. Users can add people, track positive/negative situations with marks, and see computed totals and relationship grades (friend/enemy/neutral).

## Database Changes

### 1. Create `persons` table
Stores people added by the user.

```sql
CREATE TABLE public.persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own persons" ON public.persons
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 2. Create `situations` table
Stores positive and negative situations with marks per person.

```sql
CREATE TABLE public.situations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('positive', 'negative')),
  description text NOT NULL,
  marks numeric NOT NULL CHECK (marks >= 1 AND marks <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.situations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own situations" ON public.situations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Frontend Changes

### 3. Dashboard page (`src/pages/Dashboard.tsx`)
Replace the current welcome screen with the full relationship tracker:
- Dark-themed header with "Life Ledger" branding, user email, sign out button
- "Your Relationships" section with input + "Add Person" button
- Table columns: Person Name | Positive Situations | Marks+ | Negative Situations | Marks- | Total | Final Relation
- Each row: Add/View buttons for positive & negative situations, computed totals, grade badge
- Delete Account button at the bottom

### 4. New components
- **`src/components/AddSituationDialog.tsx`** -- Modal to add a situation (description + marks 1-100) for a person, either positive or negative
- **`src/components/ViewSituationsDialog.tsx`** -- Modal to view list of situations for a person (with delete option)
- **`src/components/RelationBadge.tsx`** -- Displays Friend/Enemy/Neutral with grade (A+/A/B/C) based on total marks

### 5. Grading logic
- Total = sum of positive marks - sum of negative marks
- Positive total: **Friend** -- C (1-10), B (11-50), A (51-100), A+ (101+)
- Negative total: **Enemy** -- C (-1 to -10), B (-11 to -50), A (-51 to -100), A+ (-101+)
- Total = 0: **Neutral**

### 6. Delete Account
Button calls `supabase.auth.admin` is not available client-side, so it will sign the user out and show a message to contact support, or we can use an edge function. For now, implement as sign-out with account deletion via an edge function.

## Visual Style
Dark theme matching the screenshot -- dark background, cyan/teal accents for headers, red for enemy badges and delete button, green for friend badges. The app already uses Tailwind so this maps to custom classes.


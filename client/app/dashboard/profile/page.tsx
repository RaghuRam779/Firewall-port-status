"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: async (newName: string) => {
      const { data } = await api.put("/auth/profile", { name: newName });
      return data.user;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className="text-sm text-slate-400">Manage your account information.</p>
      </div>

      <div className="glass-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-base font-semibold text-white">{user?.name}</div>
            <div className="text-sm text-slate-400">{user?.email}</div>
            <div className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize text-slate-300">
              {user?.role}
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(name);
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Full name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-field opacity-60" value={user?.email ?? ""} disabled />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            {saved && <span className="text-xs text-success">Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

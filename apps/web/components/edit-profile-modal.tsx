"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useUpdateProfile } from "@repo/query/users/useUserMutations";
import { toast } from "react-hot-toast";
import { X, User, Lock, Image as ImageIcon, Save, KeyRound } from "lucide-react";

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { data: session, update } = useSession();
  const userId = (session?.user as any)?.id;
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState(session?.user?.name || "");
  const [image, setImage] = useState(session?.user?.image || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User session not found.");
      return;
    }

    if (changePasswordOpen) {
      if (!newPassword || newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }
    }

    const payload: any = {
      name: name.trim() || undefined,
      image: image.trim() || undefined,
    };

    if (changePasswordOpen && newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    updateProfileMutation.mutate(
      { userId, data: payload },
      {
        onSuccess: async (res: any) => {
          toast.success("Profile updated successfully!");
          try {
            await update({ name: res.data?.name || name, image: res.data?.image || image });
          } catch {}
          onClose();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update profile.");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-md rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--c-surface)" }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--c-border)]/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--c-primary)]/15 text-[var(--c-primary)] border border-[var(--c-primary)]/30">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--c-text)]" style={fontDisplay}>
                Edit Profile
              </h2>
              <p className="text-xs text-[var(--c-muted)]">Update your name, picture, or password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--c-muted)] hover:bg-[var(--c-surface-soft)] hover:text-[var(--c-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5 uppercase tracking-wider">
              Display Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-soft)] pl-10 pr-4 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-muted)] outline-none focus:border-[var(--c-primary)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5 uppercase tracking-wider">
              Avatar URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-soft)] pl-10 pr-4 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-muted)] outline-none focus:border-[var(--c-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Change Password Collapsible */}
          <div className="pt-2 border-t border-[var(--c-border)]/50">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(!changePasswordOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-[var(--c-primary)] hover:underline"
            >
              <KeyRound size={14} />
              {changePasswordOpen ? "Cancel password change" : "Change account password"}
            </button>

            {changePasswordOpen && (
              <div className="mt-3 space-y-3 p-3 rounded-2xl bg-[var(--c-surface-soft)]/50 border border-[var(--c-border)]/50 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-2 text-xs text-[var(--c-text)] outline-none focus:border-[var(--c-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-2 text-xs text-[var(--c-text)] outline-none focus:border-[var(--c-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-2 text-xs text-[var(--c-text)] outline-none focus:border-[var(--c-primary)]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--c-border)]/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a8fe43] text-[#07140c] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={14} />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";

interface SettingsFormProps {
  settings: {
    theme: string;
    emailNotifications: boolean;
    newsletterOptIn: boolean;
    profilePublic: boolean;
    language: string;
  };
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, {
    success: false,
  });

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      {state.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Settings saved.
        </div>
      )}

      <div>
        <label htmlFor="theme" className="text-sm font-medium">
          Theme preference
        </label>
        <select
          id="theme"
          name="theme"
          defaultValue={settings.theme}
          className="mt-2 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-ring"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="emailNotifications"
          defaultChecked={settings.emailNotifications}
          className="rounded border-input"
        />
        Email notifications for engagement
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="newsletterOptIn"
          defaultChecked={settings.newsletterOptIn}
          className="rounded border-input"
        />
        Newsletter opt-in
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="profilePublic"
          defaultChecked={settings.profilePublic}
          className="rounded border-input"
        />
        Public author profile
      </label>

      <div>
        <label htmlFor="language" className="text-sm font-medium">
          Language
        </label>
        <select
          id="language"
          name="language"
          defaultValue={settings.language}
          className="mt-2 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-ring"
        >
          <option value="en">English</option>
        </select>
      </div>

      <Button type="submit" loading={pending}>
        Save settings
      </Button>
    </form>
  );
}

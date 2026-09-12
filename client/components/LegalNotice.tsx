"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function LegalNotice({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-warning">
        <ExclamationTriangleIcon className="h-5 w-5" />
        <span className="text-sm font-semibold">Authorized use only</span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        Scanning networks or systems without permission may violate the Computer Fraud and Abuse
        Act (or equivalent laws in your jurisdiction) and the target&apos;s terms of service. Only
        scan systems you own or have explicit written authorization to test. This tool does not
        include, and will not add, features designed to bypass authorization or evade detection.
      </p>
      <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent accent-accent"
        />
        I confirm I own this target or have explicit authorization to test it.
      </label>
    </div>
  );
}

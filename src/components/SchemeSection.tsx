"use client";

import { SeveranceForm, CompensationScheme, SCHEME_OPTIONS } from "@/lib/types";

interface Props {
  form: SeveranceForm;
  onChange: (patch: Partial<SeveranceForm>) => void;
}

export default function SchemeSection({ form, onChange }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        辞退方案
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCHEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ scheme: opt.value as CompensationScheme })}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              form.scheme === opt.value
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {opt.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {opt.description}
            </div>
            <div className="text-sm font-mono mt-1 text-blue-600 dark:text-blue-400">
              {opt.formula}
            </div>
          </button>
        ))}
      </div>

      {(form.scheme === "custom" || form.scheme === "N") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            N 系数
          </label>
          <div className="flex gap-2 items-center">
            {[0.5, 1.0, 1.5, 2.0].map((v) => (
              <button
                key={v}
                onClick={() => onChange({ nCoefficient: v })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  form.nCoefficient === v
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {v}
              </button>
            ))}
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.nCoefficient || ""}
              onChange={(e) => onChange({ nCoefficient: parseFloat(e.target.value) || 0 })}
              className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="自定义"
            />
          </div>
        </div>
      )}
    </section>
  );
}

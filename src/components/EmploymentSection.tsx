"use client";

import { SeveranceForm } from "@/lib/types";

interface Props {
  form: SeveranceForm;
  yearsOfWork: number;
  onChange: (patch: Partial<SeveranceForm>) => void;
}

export default function EmploymentSection({ form, yearsOfWork, onChange }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        基本信息
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            入职日期
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            离职日期
          </label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          工作年限 (N)：<span className="font-bold text-lg">{yearsOfWork}</span> 年
          <span className="text-xs ml-2 text-blue-600 dark:text-blue-300">
            （满6个月计1年，不满6个月计0.5年）
          </span>
        </p>
      </div>
    </section>
  );
}

"use client";

import { SeveranceForm } from "@/lib/types";

interface Props {
  form: SeveranceForm;
  onChange: (patch: Partial<SeveranceForm>) => void;
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {hint && (
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
            {hint}
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SalarySection({ form, onChange }: Props) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        薪资信息
      </h2>

      {/* N Base */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          N 基数设置
        </h3>
        <div className="flex items-center gap-3 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="baseType"
              checked={!form.useCustomBase}
              onChange={() => onChange({ useCustomBase: false })}
              className="text-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              前12个月平均工资
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="baseType"
              checked={form.useCustomBase}
              onChange={() => onChange({ useCustomBase: true })}
              className="text-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              自定义基数
            </span>
          </label>
        </div>
        {!form.useCustomBase ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="月基本工资"
              value={form.monthlyBaseSalary}
              onChange={(v) => onChange({ monthlyBaseSalary: v })}
              suffix="元"
            />
            <InputField
              label="前12个月工资总额"
              value={form.last12MonthsTotal}
              onChange={(v) => onChange({ last12MonthsTotal: v })}
              suffix="元"
              hint="优先用于计算平均"
            />
          </div>
        ) : (
          <InputField
            label="自定义 N 基数（月）"
            value={form.customBase}
            onChange={(v) => onChange({ customBase: v })}
            suffix="元"
          />
        )}
      </div>

      {/* Salary items */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          可折现项目
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="当月工资（折算）"
            value={form.currentMonthSalary}
            onChange={(v) => onChange({ currentMonthSalary: v })}
            suffix="元"
          />
          <InputField
            label="日工资（用于假期折现）"
            value={form.dailyWageForLeave}
            onChange={(v) => onChange({ dailyWageForLeave: v })}
            suffix="元"
            hint="= 月工资 ÷ 21.75"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="未休年假"
            value={form.unusedAnnualLeaveDays}
            onChange={(v) => onChange({ unusedAnnualLeaveDays: v })}
            suffix="天"
          />
          <InputField
            label="未休婚假"
            value={form.unusedMarriageLeaveDays}
            onChange={(v) => onChange({ unusedMarriageLeaveDays: v })}
            suffix="天"
          />
          <InputField
            label="调休"
            value={form.unusedCompDays}
            onChange={(v) => onChange({ unusedCompDays: v })}
            suffix="天"
          />
          <InputField
            label="加班时长"
            value={form.overtimeHours}
            onChange={(v) => onChange({ overtimeHours: v })}
            suffix="小时"
          />
          <InputField
            label="加班时薪"
            value={form.overtimeHourlyRate}
            onChange={(v) => onChange({ overtimeHourlyRate: v })}
            suffix="元"
          />
          <InputField
            label="年终奖总额"
            value={form.yearEndBonus}
            onChange={(v) => onChange({ yearEndBonus: v })}
            suffix="元"
          />
          <InputField
            label="本年已工作月数"
            value={form.monthsWorkedThisYear}
            onChange={(v) => onChange({ monthsWorkedThisYear: v })}
            suffix="月"
          />
          <InputField
            label="未休丧假"
            value={form.unusedBereavementLeaveDays}
            onChange={(v) => onChange({ unusedBereavementLeaveDays: v })}
            suffix="天"
          />
          <InputField
            label="未休陪产假"
            value={form.unusedPaternityLeaveDays}
            onChange={(v) => onChange({ unusedPaternityLeaveDays: v })}
            suffix="天"
          />
        </div>
      </div>

      {/* Tax config */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          免税额度配置
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              所在城市
            </label>
            <select
              value={form.cityPreset}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const preset = import("@/lib/types").then((m) => {
                    const city = m.CITY_PRESETS.find((c) => c.name === val);
                    if (city) onChange({ cityPreset: val, localAverageSalary: city.averageSalary });
                  });
                } else {
                  onChange({ cityPreset: val });
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">手动输入</option>
            </select>
          </div>
          <InputField
            label="当地月平均工资"
            value={form.localAverageSalary}
            onChange={(v) => onChange({ localAverageSalary: v, cityPreset: "" })}
            suffix="元"
            hint="用于计算免税额度"
          />
        </div>
      </div>
    </section>
  );
}

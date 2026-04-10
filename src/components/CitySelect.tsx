"use client";

import { CITY_PRESETS } from "@/lib/types";

interface Props {
  value: string;
  onSelect: (city: string, salary: number) => void;
}

export default function CitySelect({ value, onSelect }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const name = e.target.value;
        if (!name) {
          onSelect("", 0);
          return;
        }
        const city = CITY_PRESETS.find((c) => c.name === name);
        if (city) onSelect(city.name, city.averageSalary);
      }}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">手动输入</option>
      {CITY_PRESETS.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name} ({c.averageSalary.toLocaleString()}元)
        </option>
      ))}
    </select>
  );
}

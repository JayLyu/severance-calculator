export interface SeveranceForm {
  // Employment info
  startDate: string;
  endDate: string;
  yearsOfWork: number; // calculated N value

  // Compensation scheme
  scheme: CompensationScheme;
  nCoefficient: number; // default 1.0

  // Salary inputs
  monthlyBaseSalary: number;
  last12MonthsTotal: number;
  useCustomBase: boolean;
  customBase: number;

  // Salary items
  currentMonthSalary: number;
  unusedAnnualLeaveDays: number;
  dailyWageForLeave: number;
  unusedMarriageLeaveDays: number;
  unusedCompDays: number;
  overtimeHours: number;
  overtimeHourlyRate: number;
  yearEndBonus: number;
  monthsWorkedThisYear: number;
  unusedBereavementLeaveDays: number;
  unusedPaternityLeaveDays: number;

  // Tax exemption
  localAverageSalary: number;
  cityPreset: string;
}

export type CompensationScheme = "2N" | "N+1" | "N" | "custom";

export interface SchemeOption {
  value: CompensationScheme;
  label: string;
  description: string;
  formula: string;
}

export const SCHEME_OPTIONS: SchemeOption[] = [
  {
    value: "2N",
    label: "违法解除/立即辞退",
    description: "用人单位违法解除劳动合同",
    formula: "2N",
  },
  {
    value: "N+1",
    label: "合法解除/30天通知辞退",
    description: "合法解除但未提前30天书面通知",
    formula: "N+1",
  },
  {
    value: "N",
    label: "协商解除",
    description: "双方协商一致解除劳动合同",
    formula: "N",
  },
  {
    value: "custom",
    label: "自定义方案",
    description: "其他方案，可自定义系数",
    formula: "自定义系数 × N",
  },
];

export interface CalculationResult {
  // N calculation
  yearsOfWork: number;
  nBase: number;
  nAmount: number;

  // Scheme multiplier
  schemeMultiplier: number;
  schemeAmount: number;
  oneMonthPay: number; // the +1 in N+1

  // Salary items breakdown
  currentMonthSalary: number;
  annualLeavePayout: number;
  marriageLeavePayout: number;
  compTimePayout: number;
  overtimePayout: number;
  yearEndBonusPayout: number;
  bereavementLeavePayout: number;
  paternityLeavePayout: number;

  // Subtotal
  salaryItemsTotal: number;
  severancePay: number;

  // Tax
  taxExemptionLimit: number;
  taxableAmount: number;

  // Grand total
  grandTotal: number;
}

export const DEFAULT_FORM: SeveranceForm = {
  startDate: "",
  endDate: "",
  yearsOfWork: 0,
  scheme: "N",
  nCoefficient: 1.0,
  monthlyBaseSalary: 0,
  last12MonthsTotal: 0,
  useCustomBase: false,
  customBase: 0,
  currentMonthSalary: 0,
  unusedAnnualLeaveDays: 0,
  dailyWageForLeave: 0,
  unusedMarriageLeaveDays: 0,
  unusedCompDays: 0,
  overtimeHours: 0,
  overtimeHourlyRate: 0,
  yearEndBonus: 0,
  monthsWorkedThisYear: 0,
  unusedBereavementLeaveDays: 0,
  unusedPaternityLeaveDays: 0,
  localAverageSalary: 0,
  cityPreset: "",
};

export interface CityPreset {
  name: string;
  averageSalary: number;
}

export const CITY_PRESETS: CityPreset[] = [
  { name: "北京", averageSalary: 13930 },
  { name: "上海", averageSalary: 13490 },
  { name: "广州", averageSalary: 13193 },
  { name: "深圳", averageSalary: 14500 },
  { name: "杭州", averageSalary: 12853 },
  { name: "成都", averageSalary: 10042 },
  { name: "南京", averageSalary: 12195 },
  { name: "武汉", averageSalary: 10316 },
  { name: "苏州", averageSalary: 12206 },
  { name: "重庆", averageSalary: 9353 },
  { name: "天津", averageSalary: 10050 },
  { name: "西安", averageSalary: 9614 },
];

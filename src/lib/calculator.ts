// 离职赔偿计算核心逻辑

export type SchemeType = 'illegal' | 'legal-30day' | 'mutual' | 'custom';

export interface SchemeOption {
  value: SchemeType;
  label: string;
  description: string;
  nMultiplier: number;
  extraMonths: number;
}

export const SCHEME_OPTIONS: SchemeOption[] = [
  {
    value: 'illegal',
    label: '违法解除（立即辞退）',
    description: '公司无合法理由立即辞退，赔偿 2N',
    nMultiplier: 2,
    extraMonths: 0,
  },
  {
    value: 'legal-30day',
    label: '合法解除（30天通知）',
    description: '公司提前30天书面通知或额外支付一个月工资，赔偿 N+1',
    nMultiplier: 1,
    extraMonths: 1,
  },
  {
    value: 'mutual',
    label: '协商解除',
    description: '双方协商一致解除劳动合同，通常赔偿 N',
    nMultiplier: 1,
    extraMonths: 0,
  },
  {
    value: 'custom',
    label: '自定义方案',
    description: '自行设定 N 的系数和额外月数',
    nMultiplier: 1,
    extraMonths: 0,
  },
];

export interface CalculatorInput {
  // 基本工作信息
  joinDate: string;         // 入职日期 YYYY-MM-DD
  leaveDate: string;        // 离职日期 YYYY-MM-DD
  monthlySalary: number;    // 月基本工资
  last12AvgSalary: number;  // 最近12个月平均工资

  // 方案选择
  scheme: SchemeType;
  customMultiplier: number; // 自定义 N 系数
  customExtraMonths: number;// 自定义额外月数

  // N 基数设置
  useCustomBase: boolean;   // 是否使用自定义基数
  customBase: number;       // 自定义 N 基数

  // 各项折现
  currentMonthDays: number; // 当月已工作天数
  currentMonthTotalDays: number; // 当月总工作天数
  unusedAnnualLeave: number;     // 未休年假天数
  dailyWageForLeave: number;     // 日工资（用于假折算，默认月工资/21.75）
  unusedMarriageLeave: number;   // 未休婚假天数
  unusedCompLeave: number;       // 未休调休天数/小时
  compLeaveUnit: 'day' | 'hour'; // 调休单位
  unusedBereavementLeave: number; // 未休丧假天数
  unusedPaternityLeave: number;   // 未休陪产假天数
  overtimeHours: number;          // 加班小时数
  overtimeHourlyRate: number;     // 加班时薪（默认日工资/8 * 1.5/2）

  // 年终奖
  yearEndBonus: number;     // 全年年终奖总额
  monthsWorkedThisYear: number; // 今年已工作月数

  // 免税相关
  localAvgSalary3x: number; // 当地社平工资3倍（免税上限）
}

export interface CalculatorResult {
  // 工龄
  yearsOfService: number;
  n: number;

  // N 基数
  nBase: number;

  // 经济补偿金
  severancePay: number;
  extraPay: number;
  totalSeverance: number;

  // 免税
  taxFreeAmount: number;
  taxableAmount: number;

  // 各项折现
  currentMonthPay: number;
  annualLeavePay: number;
  marriageLeavePay: number;
  compLeavePay: number;
  bereavementLeavePay: number;
  paternityLeavePay: number;
  overtimePay: number;
  yearEndBonusProrated: number;

  // 汇总
  totalAll: number;

  // 说明
  notes: string[];
}

function calcYearsOfService(join: string, leave: string): number {
  const j = new Date(join);
  const l = new Date(leave);
  const totalMonths = (l.getFullYear() - j.getFullYear()) * 12 + (l.getMonth() - j.getMonth());
  const fullYears = Math.floor(totalMonths / 12);
  const remainMonths = totalMonths % 12;
  // 不满6个月算0.5，满6个月算1
  const partialYear = remainMonths >= 6 ? 1 : (totalMonths > 0 ? 0.5 : 0);
  return fullYears + partialYear;
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const notes: string[] = [];

  // 1. 工龄和 N
  const yearsOfService = calcYearsOfService(input.joinDate, input.leaveDate);
  const n = yearsOfService;

  // 2. N 基数
  let nBase: number;
  if (input.useCustomBase && input.customBase > 0) {
    nBase = input.customBase;
    notes.push(`N 基数使用自定义值：¥${nBase.toLocaleString()}`);
  } else {
    nBase = input.last12AvgSalary || input.monthlySalary;
    if (input.last12AvgSalary > 0) {
      notes.push(`N 基数使用最近12个月平均工资：¥${nBase.toLocaleString()}`);
    } else {
      notes.push(`N 基数使用月基本工资：¥${nBase.toLocaleString()}`);
    }
  }

  // 3. 方案
  const scheme = SCHEME_OPTIONS.find(s => s.value === input.scheme)!;
  const multiplier = input.scheme === 'custom' ? input.customMultiplier : scheme.nMultiplier;
  const extraMonths = input.scheme === 'custom' ? input.customExtraMonths : scheme.extraMonths;

  // 4. 经济补偿金
  const severancePay = n * multiplier * nBase;
  const extraPay = extraMonths * nBase;
  const totalSeverance = severancePay + extraPay;

  notes.push(`${scheme.label}：${multiplier}N${extraMonths > 0 ? ` + ${extraMonths}个月` : ''} = ¥${totalSeverance.toLocaleString()}`);

  // 5. 免税计算
  const taxFreeLimit = input.localAvgSalary3x * yearsOfService;
  const taxFreeAmount = Math.min(totalSeverance, taxFreeLimit);
  const taxableAmount = Math.max(0, totalSeverance - taxFreeLimit);

  if (input.localAvgSalary3x > 0 && taxableAmount > 0) {
    notes.push(`经济补偿金免税额度：¥${taxFreeLimit.toLocaleString()}（当地社平工资3倍 × 工龄${yearsOfService}年），超出部分 ¥${taxableAmount.toLocaleString()} 需缴纳个人所得税`);
  }

  // 6. 各项折现
  const dailyWage = input.dailyWageForLeave || (nBase / 21.75);

  // 当月工资折现
  const currentMonthPay = input.currentMonthTotalDays > 0
    ? nBase * (input.currentMonthDays / input.currentMonthTotalDays)
    : 0;

  // 未休年假折现（日工资 × 200% × 天数，根据《职工带薪年休假条例》）
  const annualLeavePay = dailyWage * 2 * input.unusedAnnualLeave;

  // 未休婚假折现
  const marriageLeavePay = dailyWage * input.unusedMarriageLeave;

  // 调休折现
  const compLeaveDays = input.compLeaveUnit === 'hour'
    ? input.unusedCompLeave / 8
    : input.unusedCompLeave;
  const compLeavePay = dailyWage * compLeaveDays;

  // 未休丧假折现
  const bereavementLeavePay = dailyWage * input.unusedBereavementLeave;

  // 未休陪产假折现
  const paternityLeavePay = dailyWage * input.unusedPaternityLeave;

  // 加班费
  const overtimeHourlyWage = input.overtimeHourlyRate || (dailyWage / 8 * 1.5);
  const overtimePay = overtimeHourlyWage * input.overtimeHours;

  // 年终奖折现
  const yearEndBonusProrated = input.monthsWorkedThisYear > 0
    ? input.yearEndBonus * (input.monthsWorkedThisYear / 12)
    : 0;

  // 7. 汇总
  const totalAll = totalSeverance
    + currentMonthPay
    + annualLeavePay
    + marriageLeavePay
    + compLeavePay
    + bereavementLeavePay
    + paternityLeavePay
    + overtimePay
    + yearEndBonusProrated;

  return {
    yearsOfService,
    n,
    nBase,
    severancePay,
    extraPay,
    totalSeverance,
    taxFreeAmount,
    taxableAmount,
    currentMonthPay,
    annualLeavePay,
    marriageLeavePay,
    compLeavePay,
    bereavementLeavePay,
    paternityLeavePay,
    overtimePay,
    yearEndBonusProrated,
    totalAll,
    notes,
  };
}

export function formatMoney(v: number): string {
  return `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

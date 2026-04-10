import { SeveranceForm, CompensationScheme, CalculationResult } from "./types";

/**
 * Calculate years of service (N value).
 * Partial year: >= 6 months counts as 1, < 6 months counts as 0.5.
 */
export function calculateYearsOfWork(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) return 0;

  let years = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const dayDiff = end.getDate() - start.getDate();

  // Adjust if we haven't reached the anniversary month/day
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }

  // Calculate remaining months after full years
  let remainingMonths: number;
  const anniversaryDate = new Date(start);
  anniversaryDate.setFullYear(anniversaryDate.getFullYear() + years);
  if (anniversaryDate > end) {
    anniversaryDate.setFullYear(anniversaryDate.getFullYear() - 1);
    years -= 1;
  }

  const remainingMs = end.getTime() - anniversaryDate.getTime();
  const remainingDays = remainingMs / (1000 * 60 * 60 * 24);
  remainingMonths = remainingDays / 30.44; // average days per month

  if (remainingMonths >= 6) {
    years += 1;
  } else if (remainingMonths > 0) {
    years += 0.5;
  }

  return years;
}

function getSchemeMultiplier(scheme: CompensationScheme): number {
  switch (scheme) {
    case "2N":
      return 2;
    case "N+1":
      return 1;
    case "N":
      return 1;
    case "custom":
      return 1;
    default:
      return 1;
  }
}

function getNBase(form: SeveranceForm): number {
  if (form.useCustomBase && form.customBase > 0) {
    return form.customBase;
  }
  if (form.last12MonthsTotal > 0) {
    return form.last12MonthsTotal / 12;
  }
  return form.monthlyBaseSalary;
}

export function calculate(form: SeveranceForm): CalculationResult {
  const yearsOfWork = calculateYearsOfWork(form.startDate, form.endDate);
  const nBase = getNBase(form);

  // N coefficient
  const coefficient = form.scheme === "custom" ? form.nCoefficient : form.nCoefficient;

  // N amount
  const nAmount = nBase * yearsOfWork;

  // Scheme
  const multiplier = getSchemeMultiplier(form.scheme);
  const schemeAmount = nAmount * multiplier * (form.scheme === "custom" ? coefficient : 1);
  const oneMonthPay = form.scheme === "N+1" ? nBase : 0;
  const severancePay = schemeAmount + oneMonthPay;

  // Salary items
  const currentMonthSalary = form.currentMonthSalary;
  const annualLeavePayout = form.unusedAnnualLeaveDays * form.dailyWageForLeave;
  const marriageLeavePayout = form.unusedMarriageLeaveDays * form.dailyWageForLeave;
  const compTimePayout = form.unusedCompDays * form.dailyWageForLeave;
  const overtimePayout = form.overtimeHours * form.overtimeHourlyRate;
  const yearEndBonusPayout =
    form.monthsWorkedThisYear > 0
      ? (form.yearEndBonus / 12) * form.monthsWorkedThisYear
      : 0;
  const bereavementLeavePayout = form.unusedBereavementLeaveDays * form.dailyWageForLeave;
  const paternityLeavePayout = form.unusedPaternityLeaveDays * form.dailyWageForLeave;

  const salaryItemsTotal =
    currentMonthSalary +
    annualLeavePayout +
    marriageLeavePayout +
    compTimePayout +
    overtimePayout +
    yearEndBonusPayout +
    bereavementLeavePayout +
    paternityLeavePayout;

  // Tax exemption: local average salary × 3 × years
  const taxExemptionLimit = form.localAverageSalary * 3 * yearsOfWork;
  const taxableAmount = Math.max(0, severancePay - taxExemptionLimit);

  const grandTotal = severancePay + salaryItemsTotal;

  return {
    yearsOfWork,
    nBase,
    nAmount,
    schemeMultiplier: multiplier,
    schemeAmount,
    oneMonthPay,
    currentMonthSalary,
    annualLeavePayout,
    marriageLeavePayout,
    compTimePayout,
    overtimePayout,
    yearEndBonusPayout,
    bereavementLeavePayout,
    paternityLeavePayout,
    salaryItemsTotal,
    severancePay,
    taxExemptionLimit,
    taxableAmount,
    grandTotal,
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function generateReport(form: SeveranceForm, result: CalculationResult): string {
  const f = formatCurrency;
  const scheme = form.scheme === "2N" ? "违法解除(2N)" : form.scheme === "N+1" ? "合法解除(N+1)" : form.scheme === "N" ? "协商解除(N)" : "自定义方案";

  return `
离职赔偿计算报告
================

【基本信息】
入职日期：${form.startDate || "未填写"}
离职日期：${form.endDate || "未填写"}
工作年限(N)：${result.yearsOfWork}
辞退方案：${scheme}
${form.scheme === "custom" ? `自定义系数：${form.nCoefficient}` : ""}

【经济补偿金】
N基数(月)：¥${f(result.nBase)}
N = ${result.yearsOfWork} × ¥${f(result.nBase)} = ¥${f(result.nAmount)}
${form.scheme === "2N" ? `2N = ¥${f(result.schemeAmount)}` : ""}
${form.scheme === "N+1" ? `N = ¥${f(result.schemeAmount)}` : ""}
${form.scheme === "N+1" ? `+1个月代通知金 = ¥${f(result.oneMonthPay)}` : ""}
经济补偿金合计：¥${f(result.severancePay)}

【可折现项目】
当月工资：¥${f(result.currentMonthSalary)}
未休年假折现：¥${f(result.annualLeavePayout)}
未休婚假折现：¥${f(result.marriageLeavePayout)}
调休折现：¥${f(result.compTimePayout)}
加班费折现：¥${f(result.overtimePayout)}
年终奖折现：¥${f(result.yearEndBonusPayout)}
未休丧假折现：¥${f(result.bereavementLeavePayout)}
未休陪产假折现：¥${f(result.paternityLeavePayout)}
可折现项目小计：¥${f(result.salaryItemsTotal)}

【税务信息】
经济补偿金免税额度：¥${f(result.taxExemptionLimit)}
应税金额：¥${f(result.taxableAmount)}

【总计】
¥${f(result.grandTotal)}

【说明】
- 期权/RSU：请根据实际协议另行计算，此处不计入总额
- 社保公积金：请向公司HR确认结算方式和金额
- 经济补偿金免税：当地上年度职工月平均工资 × 3 × 工作年限，超出部分需缴纳个人所得税
`.trim();
}

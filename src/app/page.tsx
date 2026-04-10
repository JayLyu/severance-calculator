'use client';

import { useState, useMemo } from 'react';
import {
  CalculatorInput,
  CalculatorResult,
  SchemeType,
  SCHEME_OPTIONS,
  calculate,
  formatMoney,
} from '@/lib/calculator';

const defaultInput: CalculatorInput = {
  joinDate: '',
  leaveDate: new Date().toISOString().slice(0, 10),
  monthlySalary: 0,
  last12AvgSalary: 0,
  scheme: 'mutual',
  customMultiplier: 1,
  customExtraMonths: 0,
  useCustomBase: false,
  customBase: 0,
  currentMonthDays: 0,
  currentMonthTotalDays: 21,
  unusedAnnualLeave: 0,
  dailyWageForLeave: 0,
  unusedMarriageLeave: 0,
  unusedCompLeave: 0,
  compLeaveUnit: 'day',
  unusedBereavementLeave: 0,
  unusedPaternityLeave: 0,
  overtimeHours: 0,
  overtimeHourlyRate: 0,
  yearEndBonus: 0,
  monthsWorkedThisYear: 0,
  localAvgSalary3x: 0,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function NumberInput({ value, onChange, placeholder = '0', ...props }: {
  value: number; onChange: (v: number) => void; placeholder?: string;
  min?: number; step?: number;
}) {
  return (
    <input
      type="number"
      value={value || ''}
      onChange={e => onChange(Number(e.target.value))}
      placeholder={placeholder}
      min={props.min ?? 0}
      step={props.step ?? 0.01}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
    />
  );
}

function ResultRow({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 ${sub ? 'pl-4 text-sm' : ''} ${highlight ? 'text-lg font-bold text-blue-600 dark:text-blue-400' : ''}`}>
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className={highlight ? '' : 'font-medium text-gray-900 dark:text-gray-100'}>{value}</span>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState<CalculatorInput>(defaultInput);
  const [copied, setCopied] = useState(false);

  const update = <K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const result: CalculatorResult = useMemo(() => calculate(input), [input]);

  const schemeOption = SCHEME_OPTIONS.find(s => s.value === input.scheme)!;

  const copyResult = () => {
    const lines = [
      `【离职赔偿计算结果】`,
      `方案：${schemeOption.label}`,
      `工龄：${result.yearsOfService} 年（N=${result.n}）`,
      `N 基数：${formatMoney(result.nBase)}`,
      ``,
      `▸ 经济补偿金：${formatMoney(result.severancePay)}`,
      result.extraPay > 0 ? `▸ 代通知金：${formatMoney(result.extraPay)}` : '',
      `▸ 补偿金合计：${formatMoney(result.totalSeverance)}`,
      result.taxableAmount > 0 ? `▸ 其中免税：${formatMoney(result.taxFreeAmount)}，应税：${formatMoney(result.taxableAmount)}` : '',
      ``,
      result.currentMonthPay > 0 ? `▸ 当月工资折现：${formatMoney(result.currentMonthPay)}` : '',
      result.annualLeavePay > 0 ? `▸ 未休年假折现：${formatMoney(result.annualLeavePay)}` : '',
      result.marriageLeavePay > 0 ? `▸ 未休婚假折现：${formatMoney(result.marriageLeavePay)}` : '',
      result.compLeavePay > 0 ? `▸ 调休折现：${formatMoney(result.compLeavePay)}` : '',
      result.bereavementLeavePay > 0 ? `▸ 未休丧假折现：${formatMoney(result.bereavementLeavePay)}` : '',
      result.paternityLeavePay > 0 ? `▸ 未休陪产假折现：${formatMoney(result.paternityLeavePay)}` : '',
      result.overtimePay > 0 ? `▸ 加班费折现：${formatMoney(result.overtimePay)}` : '',
      result.yearEndBonusProrated > 0 ? `▸ 年终奖折现：${formatMoney(result.yearEndBonusProrated)}` : '',
      ``,
      `★ 总计：${formatMoney(result.totalAll)}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">离职赔偿计算器</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">计算经济补偿金、代通知金及各项工资折现</p>
        </div>

        <div className="space-y-6">
          {/* 基本信息 */}
          <Section title="📋 基本信息">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="入职日期">
                <input
                  type="date"
                  value={input.joinDate}
                  onChange={e => update('joinDate', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>
              <Field label="离职日期">
                <input
                  type="date"
                  value={input.leaveDate}
                  onChange={e => update('leaveDate', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>
              <Field label="月基本工资" hint="合同约定的月工资">
                <NumberInput value={input.monthlySalary} onChange={v => update('monthlySalary', v)} />
              </Field>
              <Field label="最近12个月平均工资" hint="包含奖金、补贴等，用于 N 基数计算">
                <NumberInput value={input.last12AvgSalary} onChange={v => update('last12AvgSalary', v)} />
              </Field>
            </div>
          </Section>

          {/* 辞退方案 */}
          <Section title="⚖️ 辞退方案">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {SCHEME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update('scheme', opt.value)}
                  className={`text-left p-4 rounded-xl border-2 transition ${
                    input.scheme === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.description}</div>
                </button>
              ))}
            </div>

            {input.scheme === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
                <Field label="N 系数" hint="例如 0.5、1.0、1.5、2.0">
                  <NumberInput value={input.customMultiplier} onChange={v => update('customMultiplier', v)} step={0.1} />
                </Field>
                <Field label="额外月数" hint="代通知金月数">
                  <NumberInput value={input.customExtraMonths} onChange={v => update('customExtraMonths', v)} step={1} />
                </Field>
              </div>
            )}

            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={input.useCustomBase}
                  onChange={e => update('useCustomBase', e.target.checked)}
                  className="rounded border-gray-300"
                />
                使用自定义 N 基数
              </label>
              {input.useCustomBase && (
                <div className="mt-2">
                  <NumberInput value={input.customBase} onChange={v => update('customBase', v)} />
                </div>
              )}
            </div>
          </Section>

          {/* 工资折现 */}
          <Section title="💰 工资折现">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="当月已工作天数">
                <NumberInput value={input.currentMonthDays} onChange={v => update('currentMonthDays', v)} step={1} />
              </Field>
              <Field label="当月总工作天数">
                <NumberInput value={input.currentMonthTotalDays} onChange={v => update('currentMonthTotalDays', v)} step={1} />
              </Field>
            </div>
          </Section>

          {/* 假期折现 */}
          <Section title="🏖️ 假期折现">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="未休年假（天）" hint="按日工资 × 200% 计算">
                <NumberInput value={input.unusedAnnualLeave} onChange={v => update('unusedAnnualLeave', v)} step={0.5} />
              </Field>
              <Field label="未休婚假（天）">
                <NumberInput value={input.unusedMarriageLeave} onChange={v => update('unusedMarriageLeave', v)} step={0.5} />
              </Field>
              <Field label="未休丧假（天）">
                <NumberInput value={input.unusedBereavementLeave} onChange={v => update('unusedBereavementLeave', v)} step={0.5} />
              </Field>
              <Field label="未休陪产假（天）">
                <NumberInput value={input.unusedPaternityLeave} onChange={v => update('unusedPaternityLeave', v)} step={0.5} />
              </Field>
              <div>
                <Field label="未休调休">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <NumberInput value={input.unusedCompLeave} onChange={v => update('unusedCompLeave', v)} step={0.5} />
                    </div>
                    <select
                      value={input.compLeaveUnit}
                      onChange={e => update('compLeaveUnit', e.target.value as 'day' | 'hour')}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-2 text-sm"
                    >
                      <option value="day">天</option>
                      <option value="hour">小时</option>
                    </select>
                  </div>
                </Field>
              </div>
              <Field label="日工资（假期折算用）" hint="默认为月工资 ÷ 21.75">
                <NumberInput value={input.dailyWageForLeave} onChange={v => update('dailyWageForLeave', v)} />
              </Field>
            </div>
          </Section>

          {/* 加班费 */}
          <Section title="⏰ 加班费折现">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="未结算加班时长（小时）">
                <NumberInput value={input.overtimeHours} onChange={v => update('overtimeHours', v)} step={0.5} />
              </Field>
              <Field label="加班时薪" hint="默认为日工资÷8×1.5">
                <NumberInput value={input.overtimeHourlyRate} onChange={v => update('overtimeHourlyRate', v)} />
              </Field>
            </div>
          </Section>

          {/* 年终奖 */}
          <Section title="🎁 年终奖折现">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="全年年终奖总额">
                <NumberInput value={input.yearEndBonus} onChange={v => update('yearEndBonus', v)} />
              </Field>
              <Field label="今年已工作月数" hint="按比例折算年终奖">
                <NumberInput value={input.monthsWorkedThisYear} onChange={v => update('monthsWorkedThisYear', v)} step={1} />
              </Field>
            </div>
          </Section>

          {/* 免税设置 */}
          <Section title="🏦 免税计算">
            <Field label="当地社平工资 × 3 倍" hint="经济补偿金在此额度内免个税，留空则不计算免税">
              <NumberInput value={input.localAvgSalary3x} onChange={v => update('localAvgSalary3x', v)} />
            </Field>
          </Section>

          {/* 计算结果 */}
          <Section title="📊 计算结果">
            {!input.joinDate ? (
              <p className="text-gray-400 text-center py-4">请先填写入职日期</p>
            ) : (
              <>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  <ResultRow label={`工龄`} value={`${result.yearsOfService} 年（N = ${result.n}）`} />
                  <ResultRow label="N 基数" value={formatMoney(result.nBase)} />

                  <div className="py-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">经济补偿金</div>
                    <ResultRow label={`${schemeOption.label}`} value={formatMoney(result.severancePay)} sub />
                    {result.extraPay > 0 && <ResultRow label="代通知金" value={formatMoney(result.extraPay)} sub />}
                    <ResultRow label="补偿金小计" value={formatMoney(result.totalSeverance)} sub />

                    {input.localAvgSalary3x > 0 && (
                      <>
                        <ResultRow label="免税部分" value={formatMoney(result.taxFreeAmount)} sub />
                        <ResultRow label="应税部分" value={formatMoney(result.taxableAmount)} sub />
                      </>
                    )}
                  </div>

                  {result.currentMonthPay > 0 && <ResultRow label="当月工资折现" value={formatMoney(result.currentMonthPay)} />}
                  {result.annualLeavePay > 0 && <ResultRow label="未休年假折现（×200%）" value={formatMoney(result.annualLeavePay)} />}
                  {result.marriageLeavePay > 0 && <ResultRow label="未休婚假折现" value={formatMoney(result.marriageLeavePay)} />}
                  {result.compLeavePay > 0 && <ResultRow label="调休折现" value={formatMoney(result.compLeavePay)} />}
                  {result.bereavementLeavePay > 0 && <ResultRow label="未休丧假折现" value={formatMoney(result.bereavementLeavePay)} />}
                  {result.paternityLeavePay > 0 && <ResultRow label="未休陪产假折现" value={formatMoney(result.paternityLeavePay)} />}
                  {result.overtimePay > 0 && <ResultRow label="加班费折现" value={formatMoney(result.overtimePay)} />}
                  {result.yearEndBonusProrated > 0 && <ResultRow label="年终奖折现" value={formatMoney(result.yearEndBonusProrated)} />}

                  <div className="pt-4 mt-2 border-t-2 border-gray-300 dark:border-gray-600">
                    <ResultRow label="★ 总计" value={formatMoney(result.totalAll)} highlight />
                  </div>
                </div>

                {/* 备注 */}
                {result.notes.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {result.notes.map((note, i) => (
                      <p key={i}>• {note}</p>
                    ))}
                    <p>• 日工资计算标准：月工资 ÷ 21.75 天</p>
                    <p>• 未休年假按《职工带薪年休假条例》按日工资 200% 计算</p>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={copyResult}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
                  >
                    {copied ? '✓ 已复制' : '📋 复制结果'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition"
                  >
                    🖨️ 打印
                  </button>
                </div>
              </>
            )}
          </Section>

          {/* 说明 */}
          <Section title="📝 说明">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
              <p><strong>经济补偿金（N）：</strong>按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。</p>
              <p><strong>2N（违法解除）：</strong>用人单位违反本法规定解除或者终止劳动合同的，应当依照经济补偿标准的二倍向劳动者支付赔偿金。</p>
              <p><strong>N+1：</strong>用人单位提前三十日以书面形式通知劳动者本人或者额外支付劳动者一个月工资后，可以解除劳动合同。</p>
              <p><strong>免税政策：</strong>个人因与用人单位解除劳动关系而取得的一次性补偿收入，在当地上年职工平均工资3倍数额以内的部分，免征个人所得税。</p>
              <p><strong>期权/RSU：</strong>如有未归属的期权或 RSU，建议单独与公司协商处理方案，本计算器暂不包含。</p>
              <p><strong>社保公积金：</strong>离职后社保和公积金将停止缴纳，建议尽快办理转移或以灵活就业身份自行缴纳，避免断缴影响权益。</p>
            </div>
          </Section>
        </div>

        <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8 mb-4">
          本计算器仅供参考，具体赔偿方案请咨询专业律师
        </div>
      </div>
    </div>
  );
}

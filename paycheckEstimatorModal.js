export const renderPaycheckEstimatorModal = (incomeSource) => {
    const existingModal = document.getElementById("paycheckEstimatorModal")

    if (existingModal) {
        existingModal.remove()
    }

    document.body.insertAdjacentHTML("beforeend", `
        <dialog id="paycheckEstimatorModal" class="modal">
            <div class="modal-box max-w-2xl">
                <h3 class="text-lg font-bold">
                    Estimate Paycheck
                </h3>
                
                <p
                    id="estimatorIncomeSourceName"
                    class="text-sm text-base-content/70 mb-4"
                ></p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="label">Hourly Rate ($)</label>
                        <input
                            type="number"
                            id="estimatorHourlyRate"
                            class="input input-bordered w-full"
                            readonly
                        />
                    </div>

                    <div>
                        <label class="label">Overtime Multiplier</label>
                        <input
                            type="number"
                            id="estimatorOvertimeMultiplier"
                            class="input input-bordered w-full"
                            readonly
                        />
                    </div>
                </div>

                <div>
                    <label class="label">Regular Hours</label>
                    <input
                        type="number"
                        id="estimatorRegularHours"
                        class="input input-bordered w-full"
                        min="0"
                        step="0.01"
                        value="0"
                    />
                </div>

                <div>
                    <label class="label">Overtime Hours</label>
                    <input
                        type="number"
                        id="estimatorOvertimeHours"
                        class="input input-bordered w-full"
                        min="0"
                        step="0.01"
                        value="0"
                    />
                </div>

                <div>
                    <label class="label">Regular Differential Hours</label>
                    <input
                        type="number"
                        id="estimatorRegularDifferentialHours"
                        class="input input-bordered w-full"
                        min="0"
                        step="0.01"
                        value="0"
                    />
                </div>

                <div>
                    <label class="label">Overtime Differential Hours</label>
                    <input
                        type="number"
                        id="estimatorOvertimeDifferentialHours"
                        class="input input-bordered w-full"
                        min="0"
                        step="0.01"
                        value="0"
                    />
                </div>

                <div>
                    <label class="label">Shift Differential (%)</label>
                    <input
                        type="number"
                        id="estimatorDifferentialPercent"
                        class="input input-bordered w-full"
                        min="0"
                        max="100"
                        step="0.01"
                        value="0"
                    />
                </div>

                <div class="mt-5 space-y-3">
                    <h4 class="font-semibold">Additional Earnings</h4>

                    <p class="text-sm text-base-content/70">
                        Include bonuses, stipends, and other additional compensation.
                    </p>

                    <div
                        id="estimatorAdditionalEarningsContainer"
                        class="space-y-3"
                    ></div>

                    <button
                        type="button"
                        id="addEstimatorEarningButton"
                        class="btn btn-sm btn-outline"
                    >
                        + Add Earnings
                    </button>
                </div>

                <div class="bg-base-200 rounded-lg p-4 mt-4 space-y-3">
                    <h4 class="font-semibold">Earnings Breakdown</h4>
                    <div class="flex justify-between text-sm">
                        <span>Regular Pay</span>
                        <span id="estimatorRegularPay">$0.00</span>
                    </div>

                    <div class="flex justify-between text-sm">
                        <span>Overtime Pay</span>
                        <span id="estimatorOvertimePay">$0.00</span>
                    </div>

                    <div class="flex justify-between text-sm">
                        <span>Shift Differential Pay</span>
                        <span id="estimatorShiftDifferentialPay">$0.00</span>
                    </div>

                    <div class="flex justify-between text-sm">
                        <span>Additional Earnings</span>
                        <span id="estimatorAdditionalEarningsPay">$0.00</span>
                    </div>

                    <div class="border-t border-base-300 pt-3">
                        <p class="text-sm text-base-content/70">
                            Estimated Gross Pay
                        </p>

                        <p id="estimatorGrossPay" class="text-2xl font-bold"
                            $0.00
                        </p>
                    </div>
                </div>

                <div class="bg-base-200 rounded-lg p-4 mt-4 space-y-3">
                    <h4 class="font-semibold">Paycheck Summary</h4>

                    <div class="flex justify-between text-sm">
                        <span>Estimated Gross Pay</span>
                        <span id="estimatorSummaryGrossPay">$0.00</span>
                    </div>

                    <div class="flex justify-between text-sm">
                        <span>Total Deductions</span>
                        <span id="estimatorTotalDeductions">$0.00</span>
                    </div>

                    <div
                        id="estimatorDeductionBreakdown"
                        class="space-y-2 pl-3 border-1-2 border-base-300
                    ></div>

                    <div class="border-t border-base-300 pt-3">
                        <p class="text-sm text-base-content/70">
                            Estimated Net Pay
                        </p>

                        <p
                            id="estimatorNetPay"
                            class="text-2xl font-bold text-success"
                        >
                            $0.00
                        </p>
                    </div>

                    <p class="text-xs text-base-content/60">
                        Estimator based on configured deductions.
                        Actual taxes and take home-home pay may differ.
                    </p>
                </div>

                <div class="bg-base-200 rounded-lg p-4 mt-4 space-y-3">
                    <h4 class="font-semibold">Expected Bank Deposits</h4>

                    <p class="text-sm text-base-content/70">
                        Estimated distribution of your take-home pay.
                    </p>

                    <div
                        id="estimatorBankDeposits"
                        class="space-y-3">
                    </div>

                <div class="modal-action">
                    <button
                        type="button"
                        id="closePaycheckEstimatorButton"
                        class="btn"
                    >
                        Close
                    </button>
                </div>
            </div>
        </dialog>
    `)

    document.getElementById("estimatorIncomeSourceName").textContent = incomeSource.name
    document.getElementById("estimatorHourlyRate").value = incomeSource.hourly_rate
    document.getElementById("estimatorOvertimeMultiplier").value = incomeSource.overtime_multiplier

    return document.getElementById("paycheckEstimatorModal")
}
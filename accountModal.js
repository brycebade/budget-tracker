import { renderModal } from "./components/modal.js"

export const renderAccountModal = (account = null) => {
    const content = `
        <form id="accountForm" class="mt-4 space-y-4">
            <div>
                <label class="label" for="accountName">
                    <span class="label-text">Account Name</span>
                </label>

                <input
                    id="accountName"
                    class="input input-bordered w-full"
                    type="text"
                    placeholder="Account Name"
                    required
                >
            </div>

            <div>
                <label class="label" for="accountType">
                    <span class="label-text">Account Type</span>
                </label>

                <select
                    id="accountType"
                    class="select select-bordered w-full"
                    required
                >
                    <option value="" disabled selected>
                        Select Account Type
                    </option>

                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="investments">Investments</option>
                    <option value="retirement">Retirment</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="loan">Loan</option>
                </select>
            </div>

            <div>
                <label class="label" for="accountBalance">
                    <span class="label-text">Opening Balance</span>
                </label>

                <input
                    id="accountBalance"
                    class="input input-bordered w-full"
                    type="number"
                    step="0.01"
                    required
                >
            </div>

            <div id="creditCardFields" class="hidden space-y-4">
                <div class="divider">Credit Card Details</div>

                <div>
                    <label class="label" for="accountApr">
                        <span class="label-text flex items-center gap-2">
                            Purchase APR

                            <span
                                class="tooltip tooltip-right before:max-w-64 before:whitespace-normal before:text-left"
                                data-tip="Find this under Interest Charge Calculation on your latest statement."
                            >
                                <button
                                    class="btn btn-circle btn-ghost btn-xs"
                                    type="button"
                                    aria-label="Where to find purchase APR"
                                >
                                    ?
                                </button>
                            </span>
                        </span>
                    </label>

                    <input
                        id="accountApr"
                        class="input input-bordered w-full"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="28.24"
                    >
                </div>

                <div>
                    <label class="label" for="statementClosingDate">
                        <span class="label-text flex items-center gap-2">
                            Statement Closing Date

                            <span
                                class="tooltip tooltip-right before:max-w-64 before:whitespace-normal before:text-left"
                                data-tip="Enter the day of the month your billing cycle normally ends. Find it near Statement Closing Date, Closing Date, or Billing Cycle on your latest statement."
                            >
                                <span
                                    class="btn btn-circle btn-ghost btn-xs"
                                    tabindex="0"
                                >
                                    ?
                                </span>
                            </span>
                        </span>
                    </label>

                    <input
                        id="statementClosingDate"
                        class="input input-bordered w-full"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="19"
                    >
                </div>

                <div>
                    <label class="label" for="paymentDueDate">
                        <span class="label-text flex items-center gap-2">
                            Payment Due Day

                            <span
                                class="tooltip tooltip-right before:max-w-64 before:whitespace-normal before:text-left"
                                data-tip="Use the day of the month your payment is normally due."
                            >
                                <span
                                    class="btn btn-circle btn-ghost btn-xs"
                                    tabindex="0"
                                >
                                    ?
                                </span>
                            </span>
                        </span>
                    </label>

                    <input
                        id="paymentDueDate"
                        class="input input-bordered w-full"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="12"
                    >
                </div>

                <div>
                    <label class="label" for="minimumPayment">
                        <span class="label-text">Minimum Payment</span>
                    </label>

                    <input
                        id="minimumPayment"
                        class="input input-bordered w-full"
                        type="number"
                        min="0"
                        step="0.01"
                    >
                </div>
            </div>

            <div id="loanFields" class="hidden space-y-4">
                <div class="divider">Loan Details</div>

                <div>
                    <label class="label" for="loanApr">
                        <span class="label-text flex items-center gap-2">
                            APR

                            <span
                                class="tooltip tooltip-right before:max-w-64 before:whitespace-normal before:text-left"
                                data-tip="Find the annual percentage rate on the loan agreement or current statement."
                            >
                                <span
                                    class="btn btn-circle btn-ghost btn-xs"
                                    tabindex="0"
                                >
                                    ?
                                </span>
                            </span>
                        </span>
                    </label>

                    <input
                        id="loanApr"
                        class="input input-bordered w-full"
                        type="number"
                        min="0"
                        step="0.01"
                    >
                </div>

                <div>
                    <label class="label" for="scheduledPayment">
                        <span class="label-text">Scheduled Payment</span>
                    </label>

                    <input
                        id="scheduledPayment"
                        class="input input-bordered w-full"
                        type="number"
                        min="0"
                        step="0.01"
                    >
                </div>

                <div>
                    <label class="label" for="loanDueDay">
                        <span class="label-text">Next Due Date</span>
                    </label>

                    <input
                        id="loanDueDay"
                        class="input input-bordered w-full"
                        type="number"
                        min="1"
                        max="31"
                    >
                </div>

                <div>
                    <label class="label" for="paymentFrequency">
                        <span class="label-text">Payment Frequency</span>
                    </label>

                    <select
                        id="paymentFrequency"
                        class="select select-bordered w-full"
                    >
                        <option value="">Select Frequency</option>
                        <option value="monthly">Monthly</option>
                        <option value="biweekly">Every Two Weeks</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
            </div>

            <div class="modal-action">
                <button
                    id="cancelAccountButton"
                    class="btn"
                    type="button"
                >
                    Cancel
                </button>

                <button class="btn btn-primary" type="submit">
                    ${account ? "Update Account" : "Save Account"}
                </button>
            </div>
        </form>
    `

    return renderModal({
        containerId: "modalRoot",
        modalId: "accountModal",
        title: account ? "Edit Account" : "Add Account",
        content
    })
}
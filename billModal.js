import { renderModal } from "./components/modal.js"

export const renderBillModal = () => {
    const content = `
        <form id="billForm" class="mt-4 space-y-4">

            <div class="form-control">
                <label class="label" for="billName">
                    <span class="label-text">Bill Name</span>
                </label>

                <input
                    id="billName"
                    class="input input-bordered w-full"
                    type="text"
                    placeholder="Mortgage, Chase, Evergy..."
                    required
                >
            </div>

            <div class="form-control">
                <label class="label" for="billCategory">
                    <span class="label-text">Category</label>
                </label>

                <input
                    id="billCategory"
                    class="input input-bordered w-full"
                    type="text"
                    placeholder="Housing, Utilities, Debt..."
                    required
                >
            </div>

            <div class="form-control">
                <label class="label" for="billExpectedAmount">
                    <span class="label-text">Expected Amount</span>
                </label>

                <input
                    id="billExpectedAmount"
                    class="input input-bordered w-full"
                    type="number"
                    min="0"
                    step="0.01"
                >
            </div>

            <div class="form-control">
                <label class="label" for="billMinimumPayment">
                    <span class="label-text">Minimum Payment</span>
                </label>

                <input
                    id="billMinimumPayment"
                    class="input input-bordered w-full"
                    type="number"
                    min="0"
                    step="0.01"
                >
            </div>

            <div class="form-control">
                <label class="label" for=:billPlannedAmount">
                    <span class="label-text">Planned Payment</span>
                </label>

                <input
                    id="billPlannedPayment"
                    type="number"
                    min="0"
                    step="0.01"
                    class="input input=bordered w-full"
                    placeholder="0.00"

            <div id="dueDayField" class="form-control">
                <label class="label" for="billDueDay">
                    <span class="label-text">Due Day</span>
                </label>

                <input
                    id="billDueDay"
                    class="input input-bordered w-full"
                    type="number"
                    min="1"
                    max="31"
                    required
                >
            </div>

            <div id="anchorDateField class="form control hidden">
                <label class="label" for="billAnchorDate">
                    <span class="label-text">First Due Date</span>
                </label>

                <input
                    id="billAnchorDate"
                    type="date"
                    class="input input-bordered w-full"
                >
            </div>

            <div class="form-control">
                <label class="label" for="billFrequency>
                    <span class="label-text">Frequency</span>
                </label>

                <select
                    id="billFrequency"
                    class="select select-bordered w-full"
                >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="weekly">Weekly</option>
                </select>
            </div>

            <div class="form-control">
                <label class="label" for="billFundingAccount">
                    <span class="label-text">Paid From</span>
                </label>

                <select
                    id="billFundingAccount"
                    class="select select-bordered w-full"
                >
                    <option value="">Select Account</option>
                </select>
            </div>

            <div class="form-control">
                <label class="label" for="billLinkedAccount">
                    <span class="label-text">Linked Debt Account</span>
                </label>

                <select
                    id="billLinkedAccount"
                    class="select select-bordered w-full"
                >

                    <option value="">None</option>
                </select>
            </div>

            <div class="modal-action">
                <button
                    id="cancelBillButton"
                    class="btn"
                    type="button"
                >
                    Cancel
                </button>

                <button
                    class="btn btn-primary"
                    type="submit"
                >
                    Save Bill
                </button>
            </div>

        </form>
    `

    return renderModal({
        containerId: "modalRoot",
        modalId: "billModal",
        title: "Add Bill",
        content
    })
}
import { renderModal } from "./components/modal.js"

export const renderBillPaymentModal = () => {
    const content = `
        <form id="billPaymentForm" class="mt-4 space-y-4">

            <div class="form-control">
                <label class="label" for="billPaymentAmount">
                    <span class="label-text">Payment Amount</span>
                </label>

                <input
                    id="billPaymentAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="input input-bordered w-full"
                    required
                >
            </div>

            <div class="form-control">
                <label class="label" for="billPaymentDate">
                    <span class="label-text">Payment Date</span>
                </label>

                <input
                    id="billPaymentDate"
                    type="date"
                    class="input input-bordered" w-full"
                    required
                >
            </div>

            <div class="modal-action>
                <button
                    id="cancelBillPaymentButton"
                    type="button"
                    class="btn"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="btn btn-primary"
                >
                    Record Payment
                </button>
            </div>
        </form>
    `

    return renderModal({
        containerId: "modalRoot",
        modalId: "billPaymentModal",
        title: "Record Payment",
        content
    })
}
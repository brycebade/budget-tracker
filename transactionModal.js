import { renderModal } from "./components/modal.js"

export const renderTransactionModal = () => {
    const content = `
        <form id="transactionForm" class="mt-4 space-y-4">
            <div>
                <label class="label" for="transactionAccount">
                    <span class="label-text">Account</span>
                </label>

                <select 
                    id="transactionAccount"
                    class="select select-bordered w-full"
                    required
                >
                    <option value="" disabled selected>
                        Select Account
                    </option>    
                </select>
            </div>

            <div>
                <label class="label" for="transactionDescription">
                    <span class="label-text">Description</span>
                </label>

                <input
                    id="transactionDescription"
                    class="input input-bordered w-full" 
                    type="text"
                    placeholder="Walmart, Paycheck, Casey's..."
                    required
                >
            </div>

            <div>
                <label class="label" for="transactionAmount">
                    <span class="label-text">Amount</span>
                </label>

                <input
                    id="transactionAmount"
                    class="input input-bordered w-full" 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                >
            </div>

            <div>
                <label class="label" for="transactionType">
                    <span class="label-text">Type</span>
                </label>

                <select 
                    id="transactionType"
                    class="select select-bordered w-full"
                    required
                >
                    <option value="" disabled selected>
                        Select Type
                    </option>
                </select>
            </div>

            <div>
                <label class="label" for="transactionCategory">
                    <span class="label-text">Category</span>
                </label>

                <input
                    id="transactionCategory"
                    class="input input-bordered w-full" 
                    type="text"
                    placeholder="Groceries, Fuel, Income..."
                    required
                >
            </div>

            <div>
                <label class="label" for="transactionDate">
                    <span class="label-text">Date</span>
                </label>

                <input
                    id="transactionDate"
                    class="input input-bordered w-full" 
                    type="date"
                    required
                >
            </div>

            <div class="modal-action">
                <button
                    id="cancelTransactionButton"
                    class="btn"
                    type="button"
                >
                    Cancel
                </button>

                <button class="btn btn-primary" type="submit">
                    Save Transaction
                </button>
            </div>
        </form>
    `

    return renderModal({
        containerId: "modalRoot",
        modalId: "transactionModal",
        title: "Add Transaction",
        content
    })
}
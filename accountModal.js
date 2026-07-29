import { renderModal } from "./components/modal.js"

export const renderAccountModal = () => {
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

            <div class="modal-action">
                <button
                    id="cancelAccountButton"
                    class="btn"
                    type="button"
                >
                    Cancel
                </button>

                <button class="btn btn-primary" type="submit">
                    Save Account
                </button>
            </div>
        </form>
    `

    return renderModal({
        containerId: "modalRoot",
        modalId: "accountModal",
        title: "Add Account",
        content
    })
}
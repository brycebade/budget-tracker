export const renderIncomeDepositModal = () => {
    const existingModal = document.getElementById("incomeDepositModal")

    if (existingModal) {
        existingModal.remove()
    }

    document.body.insertAdjacentHTML("beforeend", `
        <dialog id="incomeDepositModal" class="modal">
            <div class="modal-box">
                <h3 class="text-lg font-bold mb-4">
                    Configure Paycheck Deposits
                </h3>
                
                <div id="depositRulesContainer" class="space-y-3"></div>

                <button
                    type="button"
                    id="addDepositAccountButton"
                    class="btn btn-sm btn-outline mt-3"
                >
                    + Add Another Account
                </button>

                <div class="modal-action">
                    <button
                        type="button"
                        id="cancelDepositButton"
                        class="btn"
                    >
                        Close
                    </button>
                </div>

                <div class="modal-action">
                    <button
                        type="button"
                        id="saveDepositRulesButton"
                        class="btn"
                    >
                        Save Distribution
                    </button>
                </div>
            </div>
        </dialog>
    `)

    return document.getElementById("incomeDepositModal")
}
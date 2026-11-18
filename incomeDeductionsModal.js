export const renderIncomeDeductionsModal = () => {
    const existingModal = document.getElementById("incomeDeductionModal")

    if (existingModal) {
        existingModal.remove()
    }

    document.body.insertAdjacentHTML("beforeend", `
        <dialog id="incomeDeductionsModal" class="modal">
            <div class="modal-box">
                <h3 class="text-lg font-bold mb-4">
                    Configure Paycheck Deductions
                </h3>

                <div
                    id="incomeDeductionsContainer"
                    class="space-y-3"
                ></div>

                <button
                    type="button"
                    id="addIncomeDeductionButton"
                    class="btn btn-sm btn-outline mt-3"
                >
                    + Add Deduction
                </button>

                <div class="modal-action">
                    <button
                        type="button"
                        id="saveIncomeDeductionsButton"
                        class="btn btn-primary"
                    >
                        Save Deductions
                    </button>

                    <button
                        type="button"
                        id="closeDeductionsButton"
                        class="btn"
                    >
                        Close
                    </button>
                </div>
            </div>
        </dialog>
    `)

    return document.getElementById("incomeDeductionsModal")
}
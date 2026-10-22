export const renderIncomeSourceModal = () => {
    const existingModal = document.getElementById("incomeSourceModal")

    if (existingModal) {
        existingModal.remove()
    }

    document.body.insertAdjacentHTML("beforeend", `
            <dialog id="incomeSourceModal" class="modal">
                <div class="modal-box">
                    <h3 class="text-lg font-bold mb-4">
                        Add Income Source
                    </h3>

                    <form id="incomeSourceForm" class="space-y-4">
                        <div>
                            <label class="label">Income Name</label>
                            <input
                                id="incomeName"
                                type="text"
                                class="input input-bordered w-full"
                                placeholder="Example: Employer"
                                required
                            />
                        </div>

                        <div>
                            <label class="label">Pay Type</label>
                            <select
                                id="incomePayType"
                                class="select select-bordered w-full"
                                required
                            >
                                <option value="hourly">Hourly</option>
                                <option value="salary">Salary</option>
                                <option value="fixed">Fixed Income</option>
                            </select>
                        </div>

                        <div>
                            <label class="label">Pay Frequency</label>
                            <select
                                id="incomeFrequency"
                                class="select select-bordered w-full"
                                required
                            >
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Biweekly</option>
                                <option value="semimonthly">Semi-monthly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        <div id="incomeAnchorDateField" hidden>
                            <label class="label">Next Known Payday</label>
                            <input
                                id="incomeAnchorDate"
                                type="date"
                                class="input input-bordered w-full"
                            />
                        </div>

                        <div id="incomePayDay1Field" hidden>
                            <label class="label">First Payday (Day of Month)</label>
                            <input
                                id="incomePayDay1"
                                type="number"
                                min="1"
                                max="31"
                                class="input input-bordered w-full"
                            />
                        </div>

                        <div id="incomePayDay2Field" hidden>
                            <label class="label">Second Payday (Day of Month)</label>
                            <input
                                id="incomePayDay2"
                                type="number"
                                min="1"
                                max="31"
                                class="input input-bordered w-full"
                            />
                        </div>

                        <div>
                            <label class="label">Deposit Account</label>
                            <select
                                id="incomeDepositAccount"
                                class="select select-bordered w-full"
                            >
                                <option value="">Select an account (optional)</option>
                            </select>
                        </div>

                        <div class="modal-action">
                            <button
                                type="button"
                                id="cancelIncomeSourceButton"
                                class="btn"
                            >
                                Cancel
                            </button>

                            <button type="submit" class="btn btn-primary">
                                Save Income Source
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        `)

        return document.getElementById("incomeSourceModal")
}
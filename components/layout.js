export const renderLayout = ({
    title,
    activePage,
    actionLabel
}) => {
    const navbar = document.getElementById("navbar")
    const sidebar = document.getElementById("sidebar")

    let actionButton = ""

    if (actionLabel) {
        actionButton = `
            <button id="pageActionButton" class="btn btn-primary">
                ${actionLabel}
            </button>
        `
    }

    navbar.className = 
        "navbar fixed top-0 left-0 z-20 h-16 bg-base-100 border-b border-base-300"

    sidebar.className =
        "fixed top-16 left-0 bottom-0 z-10 w-64 bg-base-200 border-r border-base-300"

    navbar.innerHTML = `
        <div class="navbar-start px-4">
            <h1 class="text-xl font-bold">${title}</h1>
        </div>

        <div class="navbar-end px-4">
            ${actionButton}
        </div>
    `

    sidebar.innerHTML = `
        <nav class="p-4">
            <ul class="menu gap-2">
                <li>
                    <a
                        href="./index.html"
                        class="${activePage === "dashboard" ? "active" : ""}"
                    >
                        Dashboard
                    </a>
                </li>
                <li>
                    <a
                        href="./accounts.html"
                        class="${activePage === "accounts" ? "active" : ""}"
                    >
                        Accounts
                    </a>
                </li>
                <li>
                    <a
                        href="./transactions.html"
                        class="${activePage === "transactions" ? "active" : ""}"
                    >
                        Transactions
                    </a>
                </li>
                <li>
                    <a
                        href="./budgets.html"
                        class="${activePage === "budgets" ? "active" : ""}"
                    >
                        Budgets
                    </a>
                </li>
                <li>
                    <a
                        href="./bills.html"
                        class="${activePage === "bills" ? "active" : ""}"
                    >
                        Bills
                    </a>
                </li>
            </ul>
        </nav>
    `
}
export const renderLayout = ({
    title,
    activePage,
    actionLabel
}) => {
    const navbar = document.getElementById("navbar")
    const sidebar = document.getElementById("sidebar")
    const menuButton = document.getElementById("button")

    let actionButton = ""

    if (actionLabel) {
        actionButton = `
            <button id="pageActionButton" class="btn btn-primary">
                ${actionLabel}
            </button>
        `
    }

    menuButton.className = "lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-base-300 transition"

    menuButton.innerHTML = `
            <span class="text-2xl">☰</span>
        `

    navbar.className = 
        "navbar fixed top-0 left-0 z-20 h-16 bg-base-200 border-b border-base-300"

    sidebar.className =
        "hidden lg:block fixed top-16 left-0 bottom-0 z-10 w-64 bg-base-200 border-r border-base-300"

    navbar.innerHTML = `
        <div class="navbar-start px-4">

        navbar.appendChild(menuButton)
        
            <a 
                href="./index.html"
                class="text-xl font-bold tracking-tight"
            >
                Lumicairn | Financial Planner
            </a>
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
                        class="${
                            activePage === "dashboard" 
                                ? "bg-base-100 font-semibold"
                                : ""
                        }"
                    >
                        Dashboard
                    </a>
                </li>
                <li>
                    <a
                        href="./accounts.html"
                        class="${
                            activePage === "accounts" 
                                ? "bg-base-100 font-semibold"
                                : ""
                        }"
                    >
                        Accounts
                    </a>
                </li>
                <li>
                    <a
                        href="./transactions.html"
                        class="${
                            activePage === "transactions" 
                                ? "bg-base-100 font-semibold"
                                : ""
                        }"
                    >
                        Transactions
                    </a>
                </li>
                <li>
                    <a
                        href="./budgets.html"
                        class="${
                            activePage === "budgets" 
                                ? "bg-base-100 font-semibold"
                                : ""
                        }"
                    >
                        Budgets
                    </a>
                </li>
                <li>
                    <a
                        href="./bills.html"
                        class="${
                            activePage === "bills" 
                                ? "bg-base-100 font-semibold"
                                : ""
                        }"
                    >
                        Bills
                    </a>
                </li>
            </ul>
        </nav>
    `
}
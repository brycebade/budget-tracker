export const renderLayout = ({
    title,
    activePage,
    actionLabel
}) => {
    const navbar = document.getElementById("navbar")
    const sidebar = document.getElementById("sidebar")
    const sidebarBackdrop = document.createElement("div")
    sidebarBackdrop.id = "sidebarBackdrop"
    const menuButton = document.createElement("button")

    let actionButton = ""

    if (actionLabel) {
        actionButton = `
            <button id="pageActionButton" class="btn btn-primary">
                ${actionLabel}
            </button>
        `
    }

    menuButton.className = 
        "lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-base-300 transition"

    menuButton.innerHTML = `
            <span class="text-2xl">☰</span>
        `

    navbar.className = 
        "navbar fixed top-0 left-0 z-20 h-16 bg-base-200 border-b border-base-300"

    sidebar.className =
        "hidden lg:block fixed top-16 left-0 bottom-0 z-10 w-64 bg-base-200 border-r border-base-300"

    sidebarBackdrop.className = 
        "hidden fixed inset-0 z-[9] bg-black/70 lg:hidden"

    navbar.innerHTML = `
        <div class="navbar-start px-4" id="navbarStart">

            <a 
                href="./index.html"
                class="text-xl font-bold tracking-tight whitespace-nowrap"
            >
                <span class="sm:hidden">
                    Lumicairn
                </span>

                <span class="hidden sm:inline">
                    Lumicairn | Financial Planner
                </span>
            </a>
        </div>

        <div class="navbar-end px-4">
            ${actionButton}
        </div>
    `

    const navbarStart = navbar.querySelector("#navbarStart")
    
    navbarStart.prepend(menuButton)
    document.body.appendChild(sidebarBackdrop)

    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("hidden")
        sidebarBackdrop.classList.toggle("hidden")
    })

    sidebarBackdrop.addEventListener("click", () => {
        sidebar.classList.add("hidden")
        sidebarBackdrop.classList.add("hidden")
    })

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
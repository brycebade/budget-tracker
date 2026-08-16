const isCodespaces = window.location.hostname.endsWith(".app.github.dev")
const isGitHubPages = window.location.hostname.endsWith(".github.io")

export const API_BASE_URL = isCodespaces
    ? `https://${window.location.hostname.replace("-5000.", "-3000.")}`
    : isGitHubPages
        ? "https://budget-tracker-api-i09z.onRender.com"
        : "http://localhost:3000"
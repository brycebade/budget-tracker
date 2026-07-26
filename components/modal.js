export const renderModal = ({
    containerId,
    modalId,
    title,
    content
}) => {
    const container = document.getElementById(containerId)

    container.innerHTML = `
        <dialog id="${modalId}" class="modal">
            <div class="modal-box">
                <h2 class="text-xl font-bold">${title}</h2>

                ${content}
            </div>
        </dialog>
    `

    return document.getElementById(modalId)
}
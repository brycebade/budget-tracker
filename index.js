console.error("INDEX.JS IS RUNNING");

const form = document.getElementById("accountForm")
const acctName = document.getElementById("accountName")
const acctType = document.getElementById("accountType")
const acctBalance = document.getElementById("accountBalance")



form.addEventListener("submit", (event) => {
    event.preventDefault()
    
    const account = {
        name: acctName.value,
        type: acctType.value,
        balance: Number(acctBalance.value)
    }

    console.log(account)
    console.log(typeof account.balance)
})
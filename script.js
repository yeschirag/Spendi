// Data Management
class SpendiApp {
  constructor() {
    this.friends = this.loadFromStorage("friends") || []
    this.expenses = this.loadFromStorage("expenses") || []
    this.balances = this.loadFromStorage("balances") || {}
    this.theme = this.loadFromStorage("theme") || "light"
    this.currentEditingExpense = null
    this.currentSettlementFriend = null
    this.selectedSettlementExpenses = new Set()
    this.expenseHistory = this.loadFromStorage("expenseHistory") || []
    this.settlements = this.loadFromStorage("settlements") || []
    this.init()
  }

  init() {
    this.initTheme()
    this.updateSummary()
    this.updateBalancesList()
    this.updateExpensesList()
    this.updateFriendOptions()
    this.updateFriendsCount()
    this.setTodayDate()
    this.setupEventListeners()
  }

  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error)
      return null
    }
  }

  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error)
    }
  }

  setupEventListeners() {
    // Expense form submission
    document.getElementById("expenseForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addExpense()
    })

    // Edit expense form submission
    document.getElementById("editExpenseForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveExpenseEdit()
    })

    // Friend form submission
    document.getElementById("friendForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addFriend()
    })

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeAllModals()
      }
    })

    // Escape key to close modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals()
      }
    })
  }

  setTodayDate() {
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("expenseDate").value = today
  }

  addFriend() {
    const nameInput = document.getElementById("friendName")
    const name = nameInput.value.trim()

    if (!name) {
      this.showNotification("Please enter a friend's name", "error")
      return
    }

    if (name.toLowerCase() === "you") {
      this.showNotification('Cannot add "You" as a friend', "error")
      return
    }

    if (this.friends.includes(name)) {
      this.showNotification("Friend already exists", "warning")
      return
    }

    this.friends.push(name)
    this.balances[name] = 0

    this.saveToStorage("friends", this.friends)
    this.saveToStorage("balances", this.balances)

    this.updateFriendOptions()
    this.updateBalancesList()
    this.updateFriendsCount()
    this.updateFriendsManagementList()
    this.closeFriendModal()

    nameInput.value = ""
    this.showNotification(`${name} added successfully!`)
  }

  removeFriend(friendName) {
    if (
      confirm(`Are you sure you want to remove ${friendName}? This will delete all associated expenses and balances.`)
    ) {
      // Remove friend from friends list
      this.friends = this.friends.filter((friend) => friend !== friendName)

      // Remove balance
      delete this.balances[friendName]

      // Remove or update expenses involving this friend
      this.expenses = this.expenses.filter((expense) => {
        // Remove expenses where friend was the only other participant
        if (expense.splitWith.length === 2 && expense.splitWith.includes(friendName)) {
          return false
        }
        // Update expenses where friend was one of multiple participants
        if (expense.splitWith.includes(friendName)) {
          expense.splitWith = expense.splitWith.filter((person) => person !== friendName)
          // Recalculate balances for this expense
          this.recalculateExpenseBalances(expense)
        }
        // Remove expenses paid by the friend
        return expense.paidBy !== friendName
      })

      // Save changes
      this.saveToStorage("friends", this.friends)
      this.saveToStorage("balances", this.balances)
      this.saveToStorage("expenses", this.expenses)

      // Update UI
      this.updateSummary()
      this.updateBalancesList()
      this.updateExpensesList()
      this.updateFriendOptions()
      this.updateFriendsCount()
      this.updateFriendsManagementList()

      this.showNotification(`${friendName} removed successfully`)
    }
  }

  recalculateExpenseBalances(expense) {
    const splitAmount = expense.amount / expense.splitWith.length

    expense.splitWith.forEach((person) => {
      if (person !== expense.paidBy) {
        if (expense.paidBy === "You") {
          this.balances[person] = (this.balances[person] || 0) + splitAmount
        } else if (person === "You") {
          this.balances[expense.paidBy] = (this.balances[expense.paidBy] || 0) - splitAmount
        }
      }
    })
  }

  addExpense() {
    const title = document.getElementById("expenseTitle").value.trim()
    const amount = Number.parseFloat(document.getElementById("expenseAmount").value)
    const date = document.getElementById("expenseDate").value
    const category = document.getElementById("expenseCategory").value
    const paidBy = document.getElementById("expensePaidBy").value

    const splitWithCheckboxes = document.querySelectorAll('#splitWithList input[type="checkbox"]:checked')
    const splitWith = Array.from(splitWithCheckboxes).map((cb) => cb.value)

    // Validation
    if (!title || !amount || !date || !category || !paidBy || splitWith.length === 0) {
      this.showNotification("Please fill in all fields", "error")
      return
    }

    if (amount <= 0) {
      this.showNotification("Amount must be greater than 0", "error")
      return
    }

    // Create expense object
    const expense = {
      id: this.generateId(),
      title,
      amount,
      date,
      category,
      paidBy,
      splitWith: [...splitWith],
      settled: false,
      editHistory: [
        {
          timestamp: new Date().toISOString(),
          action: "Created",
          details: `Expense created: ${title} - ₹${amount}`,
        },
      ],
    }

    this.calculateBalances(expense)
    this.expenses.unshift(expense)

    // Add to comprehensive history
    this.addToHistory("expense", {
      title,
      amount,
      date,
      category,
      paidBy,
      splitWith: [...splitWith],
    })

    // Save to storage
    this.saveToStorage("expenses", this.expenses)
    this.saveToStorage("balances", this.balances)

    // Update UI
    this.updateSummary()
    this.updateBalancesList()
    this.updateExpensesList()
    this.closeExpenseModal()

    // Reset form
    document.getElementById("expenseForm").reset()
    this.setTodayDate()

    this.showNotification("Expense added successfully!")
  }

  calculateBalances(expense) {
    const splitAmount = expense.amount / expense.splitWith.length

    expense.splitWith.forEach((person) => {
      if (person !== expense.paidBy) {
        if (expense.paidBy === "You") {
          this.balances[person] = (this.balances[person] || 0) + splitAmount
        } else if (person === "You") {
          this.balances[expense.paidBy] = (this.balances[expense.paidBy] || 0) - splitAmount
        }
      }
    })

    if (expense.paidBy !== "You" && expense.splitWith.includes("You")) {
      this.balances[expense.paidBy] = (this.balances[expense.paidBy] || 0) - splitAmount
    }
  }

  editExpense(expenseId) {
    const expense = this.expenses.find((exp) => exp.id === expenseId)
    if (!expense) return

    this.currentEditingExpense = { ...expense }

    // Populate edit form
    document.getElementById("editExpenseTitle").value = expense.title
    document.getElementById("editExpenseAmount").value = expense.amount
    document.getElementById("editExpenseDate").value = expense.date
    document.getElementById("editExpenseCategory").value = expense.category

    // Update paid by options for edit form
    this.updateEditFriendOptions()
    document.getElementById("editExpensePaidBy").value = expense.paidBy

    // Update split with checkboxes
    const editSplitCheckboxes = document.querySelectorAll('#editSplitWithList input[type="checkbox"]')
    editSplitCheckboxes.forEach((checkbox) => {
      checkbox.checked = expense.splitWith.includes(checkbox.value)
    })

    // Show edit history
    this.updateEditHistory(expense)

    // Show modal
    document.getElementById("editExpenseModal").style.display = "block"
  }

  updateEditHistory(expense) {
    const historyList = document.getElementById("editHistoryList")
    if (!expense.editHistory || expense.editHistory.length === 0) {
      historyList.innerHTML = '<p class="no-data">No edit history available</p>'
      return
    }

    const historyItems = expense.editHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map((edit) => {
        const date = new Date(edit.timestamp).toLocaleString()
        return `
          <div class="edit-history-item">
            <div class="edit-timestamp">${date}</div>
            <div>${edit.action}: ${edit.details}</div>
          </div>
        `
      })
      .join("")

    historyList.innerHTML = historyItems
  }

  saveExpenseEdit() {
    if (!this.currentEditingExpense) return

    const originalExpense = this.expenses.find((exp) => exp.id === this.currentEditingExpense.id)
    if (!originalExpense) return

    // Get new values
    const newTitle = document.getElementById("editExpenseTitle").value.trim()
    const newAmount = Number.parseFloat(document.getElementById("editExpenseAmount").value)
    const newDate = document.getElementById("editExpenseDate").value
    const newCategory = document.getElementById("editExpenseCategory").value
    const newPaidBy = document.getElementById("editExpensePaidBy").value

    const splitWithCheckboxes = document.querySelectorAll('#editSplitWithList input[type="checkbox"]:checked')
    const newSplitWith = Array.from(splitWithCheckboxes).map((cb) => cb.value)

    // Validation
    if (!newTitle || !newAmount || !newDate || !newCategory || !newPaidBy || newSplitWith.length === 0) {
      this.showNotification("Please fill in all fields", "error")
      return
    }

    if (newAmount <= 0) {
      this.showNotification("Amount must be greater than 0", "error")
      return
    }

    // Reverse original balance calculations
    this.reverseBalanceCalculations(originalExpense)

    // Track changes for edit history
    const changes = []
    if (originalExpense.title !== newTitle) changes.push(`Title: "${originalExpense.title}" → "${newTitle}"`)
    if (originalExpense.amount !== newAmount) changes.push(`Amount: ₹${originalExpense.amount} → ₹${newAmount}`)
    if (originalExpense.date !== newDate) changes.push(`Date: ${originalExpense.date} → ${newDate}`)
    if (originalExpense.category !== newCategory) changes.push(`Category: ${originalExpense.category} → ${newCategory}`)
    if (originalExpense.paidBy !== newPaidBy) changes.push(`Paid by: ${originalExpense.paidBy} → ${newPaidBy}`)

    const originalSplitStr = originalExpense.splitWith.sort().join(", ")
    const newSplitStr = newSplitWith.sort().join(", ")
    if (originalSplitStr !== newSplitStr) changes.push(`Split with: ${originalSplitStr} → ${newSplitStr}`)

    // Update expense
    originalExpense.title = newTitle
    originalExpense.amount = newAmount
    originalExpense.date = newDate
    originalExpense.category = newCategory
    originalExpense.paidBy = newPaidBy
    originalExpense.splitWith = [...newSplitWith]

    // Add edit history
    if (!originalExpense.editHistory) originalExpense.editHistory = []
    originalExpense.editHistory.push({
      timestamp: new Date().toISOString(),
      action: "Edited",
      details: changes.length > 0 ? changes.join("; ") : "No changes detected",
    })

    // Recalculate balances with new values
    this.calculateBalances(originalExpense)

    // Add to comprehensive history
    this.addToHistory("edit", {
      title: newTitle,
      originalTitle: originalExpense.title,
      changes: changes.length > 0 ? changes.join("; ") : "No changes detected",
      expenseId: originalExpense.id,
    })

    // Save to storage
    this.saveToStorage("expenses", this.expenses)
    this.saveToStorage("balances", this.balances)

    // Update UI
    this.updateSummary()
    this.updateBalancesList()
    this.updateExpensesList()
    this.closeEditExpenseModal()

    this.showNotification("Expense updated successfully!")
  }

  reverseBalanceCalculations(expense) {
    const splitAmount = expense.amount / expense.splitWith.length

    expense.splitWith.forEach((person) => {
      if (person !== expense.paidBy) {
        if (expense.paidBy === "You") {
          this.balances[person] = (this.balances[person] || 0) - splitAmount
        } else if (person === "You") {
          this.balances[expense.paidBy] = (this.balances[expense.paidBy] || 0) + splitAmount
        }
      }
    })

    if (expense.paidBy !== "You" && expense.splitWith.includes("You")) {
      this.balances[expense.paidBy] = (this.balances[expense.paidBy] || 0) + splitAmount
    }
  }

  deleteExpense() {
    if (!this.currentEditingExpense) return

    if (confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      const expense = this.expenses.find((exp) => exp.id === this.currentEditingExpense.id)
      if (expense) {
        // Add to history before deletion
        this.addToHistory("delete", {
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          category: expense.category,
          paidBy: expense.paidBy,
          splitWith: expense.splitWith,
        })

        // Reverse balance calculations
        this.reverseBalanceCalculations(expense)

        // Remove expense
        this.expenses = this.expenses.filter((exp) => exp.id !== this.currentEditingExpense.id)

        // Save to storage
        this.saveToStorage("expenses", this.expenses)
        this.saveToStorage("balances", this.balances)

        // Update UI
        this.updateSummary()
        this.updateBalancesList()
        this.updateExpensesList()
        this.closeEditExpenseModal()

        this.showNotification("Expense deleted successfully!")
      }
    }
  }

  updateEditFriendOptions() {
    const paidBySelect = document.getElementById("editExpensePaidBy")
    const splitWithList = document.getElementById("editSplitWithList")

    // Update paid by options
    paidBySelect.innerHTML = '<option value="You">You</option>'
    this.friends.forEach((friend) => {
      paidBySelect.innerHTML += `<option value="${friend}">${friend}</option>`
    })

    // Update split with options
    splitWithList.innerHTML = `
      <label class="checkbox-item">
        <input type="checkbox" value="You" checked>
        <span>You</span>
      </label>
    `

    this.friends.forEach((friend) => {
      splitWithList.innerHTML += `
        <label class="checkbox-item">
          <input type="checkbox" value="${friend}">
          <span>${friend}</span>
        </label>
      `
    })
  }

  updateFriendsManagementList() {
    const managementList = document.getElementById("friendsManagementList")

    if (this.friends.length === 0) {
      managementList.innerHTML = '<p class="no-data">No friends added yet.</p>'
      return
    }

    const friendItems = this.friends
      .map((friend) => {
        const balance = this.balances[friend] || 0
        const balanceText =
          balance === 0
            ? "Settled up"
            : balance > 0
              ? `Owes you ₹${balance.toFixed(2)}`
              : `You owe ₹${Math.abs(balance).toFixed(2)}`

        const balanceClass = balance === 0 ? "" : balance > 0 ? "positive" : "negative"

        return `
        <div class="friend-management-item">
          <div class="friend-info">
            <div class="friend-name">${friend}</div>
            <div class="friend-balance ${balanceClass}">${balanceText}</div>
          </div>
          <div class="friend-actions">
            ${balance !== 0 ? `<button class="btn btn-small btn-primary" onclick="showBalanceDetails('${friend}')">View Details</button>` : ""}
            <button class="btn btn-small btn-danger" onclick="removeFriend('${friend}')">Remove</button>
          </div>
        </div>
      `
      })
      .join("")

    managementList.innerHTML = friendItems
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  initTheme() {
    document.body.className = `${this.theme}-theme`
    this.updateThemeIcon()
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light"
    document.body.className = `${this.theme}-theme`
    this.saveToStorage("theme", this.theme)
    this.updateThemeIcon()
    this.showNotification(`Switched to ${this.theme} mode`)
  }

  updateThemeIcon() {
    const themeIcon = document.querySelector(".theme-icon")
    if (themeIcon) {
      themeIcon.textContent = this.theme === "light" ? "🌙" : "☀️"
    }
  }

  updateSummary() {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const personalExpenses = this.expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expense.paidBy === "You" &&
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        )
      })
      .reduce((total, expense) => total + expense.amount, 0)

    let youOwe = 0
    let othersOwe = 0

    Object.values(this.balances).forEach((balance) => {
      if (balance > 0) {
        othersOwe += balance
      } else if (balance < 0) {
        youOwe += Math.abs(balance)
      }
    })

    document.getElementById("personalExpenses").textContent = `₹${personalExpenses.toFixed(2)}`
    document.getElementById("youOwe").textContent = `₹${youOwe.toFixed(2)}`
    document.getElementById("othersOwe").textContent = `₹${othersOwe.toFixed(2)}`
  }

  updateBalancesList() {
    const balancesList = document.getElementById("balancesList")

    if (this.friends.length === 0) {
      balancesList.innerHTML =
        '<p class="no-data">No friends added yet. Add some friends to start tracking balances!</p>'
      return
    }

    const hasBalances = Object.values(this.balances).some((balance) => balance !== 0)

    if (!hasBalances) {
      balancesList.innerHTML = '<p class="no-data">All settled up! 🎉</p>'
      return
    }

    const balanceItems = this.friends
      .filter((friend) => this.balances[friend] !== 0)
      .map((friend) => {
        const balance = this.balances[friend]
        const isPositive = balance > 0
        const amount = Math.abs(balance)

        return `
          <div class="balance-item ${isPositive ? "positive" : "negative"}" onclick="showBalanceDetails('${friend}')">
            <span class="balance-name">
              ${isPositive ? `${friend} owes you` : `You owe ${friend}`}
            </span>
            <span class="balance-amount">₹${amount.toFixed(2)}</span>
          </div>
        `
      })
      .join("")

    balancesList.innerHTML = balanceItems || '<p class="no-data">All settled up! 🎉</p>'
  }

  showBalanceDetails(friendName) {
    this.currentSettlementFriend = friendName
    const modal = document.getElementById("balanceModal")
    const title = document.getElementById("balanceModalTitle")
    const detailsContainer = document.getElementById("balanceDetails")
    const netBalanceElement = document.getElementById("netBalance")
    const settleBtn = document.getElementById("settleUpBtn")

    const balance = this.balances[friendName]
    const isPositive = balance > 0
    const amount = Math.abs(balance)

    title.textContent = `Balance with ${friendName}`

    const relevantExpenses = this.expenses.filter(
      (expense) => expense.splitWith.includes(friendName) || expense.paidBy === friendName,
    )

    if (relevantExpenses.length === 0) {
      detailsContainer.innerHTML = '<p class="no-balance-details">No shared expenses found.</p>'
    } else {
      const expenseDetails = relevantExpenses
        .map((expense) => {
          const splitAmount = expense.amount / expense.splitWith.length
          let userAmount = 0
          let friendAmount = 0
          let description = ""

          if (expense.paidBy === "You" && expense.splitWith.includes(friendName)) {
            userAmount = splitAmount
            description = `You paid for ${expense.title}, ${friendName} owes their share`
          } else if (expense.paidBy === friendName && expense.splitWith.includes("You")) {
            friendAmount = splitAmount
            description = `${friendName} paid for ${expense.title}, you owe your share`
          } else {
            return null
          }

          const netAmount = userAmount - friendAmount
          const isPositiveAmount = netAmount > 0
          const displayAmount = Math.abs(netAmount)

          if (displayAmount === 0) return null

          const date = new Date(expense.date).toLocaleDateString()
          const categoryDisplay = expense.category.replace(/^[^\w\s]+\s*/, "")

          return `
            <div class="balance-detail-item" onclick="editExpense('${expense.id}')">
              <div class="balance-detail-info">
                <h4>${expense.title}</h4>
                <div class="balance-detail-meta">
                  <span>${date}</span>
                  <span class="separator">•</span>
                  <span>${categoryDisplay}</span>
                  <span class="separator">•</span>
                  <span>₹${expense.amount.toFixed(2)} total</span>
                  <span class="separator">•</span>
                  <span>${description}</span>
                </div>
              </div>
              <div class="balance-detail-amount ${isPositiveAmount ? "positive" : "negative"}">
                ${isPositiveAmount ? "+" : "-"}₹${displayAmount.toFixed(2)}
              </div>
            </div>
          `
        })
        .filter((item) => item !== null)
        .join("")

      detailsContainer.innerHTML = expenseDetails || '<p class="no-balance-details">No relevant transactions found.</p>'
    }

    netBalanceElement.textContent = `${isPositive ? "+" : "-"}₹${amount.toFixed(2)}`
    netBalanceElement.className = `summary-amount ${isPositive ? "positive" : "negative"}`

    settleBtn.onclick = () => this.settleBalance(friendName)
    modal.style.display = "block"
  }

  settleBalance(friendName) {
    if (confirm(`Are you sure you want to mark the balance with ${friendName} as settled?`)) {
      this.balances[friendName] = 0
      this.saveToStorage("balances", this.balances)

      this.updateSummary()
      this.updateBalancesList()
      this.updateFriendsManagementList()
      this.closeBalanceModal()

      this.showNotification(`Balance with ${friendName} marked as settled!`)
    }
  }

  updateExpensesList() {
    const expensesList = document.getElementById("expensesList")

    if (this.expenses.length === 0) {
      expensesList.innerHTML = '<p class="no-data">No expenses yet. Start tracking your spending!</p>'
      return
    }

    const recentExpenses = this.expenses.slice(0, 10)

    const expenseItems = recentExpenses
      .map((expense) => {
        const date = new Date(expense.date).toLocaleDateString()
        const splitInfo =
          expense.splitWith.length > 1
            ? `Split with ${expense.splitWith.filter((p) => p !== expense.paidBy).join(", ")}`
            : "Personal expense"

        const categoryClass = this.getCategoryClass(expense.category)
        const categoryDisplay = expense.category.replace(/^[^\w\s]+\s*/, "")

        return `
          <div class="expense-item" onclick="editExpense('${expense.id}')">
            <div class="expense-details">
              <h4>${expense.title}</h4>
              <div class="expense-meta">
                <span>${date}</span>
                <span class="separator">•</span>
                <span class="expense-category ${categoryClass}">${categoryDisplay}</span>
                <span class="separator">•</span>
                <span>Paid by ${expense.paidBy}</span>
                <span class="separator">•</span>
                <span>${splitInfo}</span>
              </div>
            </div>
            <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
          </div>
        `
      })
      .join("")

    expensesList.innerHTML = expenseItems
  }

  updateFriendsCount() {
    const friendsCountElement = document.getElementById("friendsCount")
    if (friendsCountElement) {
      friendsCountElement.textContent = this.friends.length
    }
  }

  getCategoryClass(category) {
    const categoryMap = {
      "Food & Dining": "category-food",
      Groceries: "category-groceries",
      Travel: "category-travel",
      Transportation: "category-transportation",
      Shopping: "category-shopping",
      Entertainment: "category-entertainment",
      "Bills & Utilities": "category-bills",
      "Rent & Housing": "category-rent",
      "Medical & Health": "category-medical",
      Education: "category-education",
      "Sports & Fitness": "category-sports",
      "Beauty & Personal Care": "category-beauty",
      "Gifts & Donations": "category-gifts",
      Insurance: "category-insurance",
      Investments: "category-investments",
      Subscriptions: "category-subscriptions",
      "Pet Care": "category-pets",
      "Home & Garden": "category-home",
      Electronics: "category-electronics",
      Clothing: "category-clothing",
      Other: "category-other",
    }

    return categoryMap[category] || "category-other"
  }

  updateFriendOptions() {
    const paidBySelect = document.getElementById("expensePaidBy")
    const splitWithList = document.getElementById("splitWithList")

    paidBySelect.innerHTML = '<option value="You">You</option>'
    this.friends.forEach((friend) => {
      paidBySelect.innerHTML += `<option value="${friend}">${friend}</option>`
    })

    splitWithList.innerHTML = `
      <label class="checkbox-item">
        <input type="checkbox" value="You" checked>
        <span>You</span>
      </label>
    `

    this.friends.forEach((friend) => {
      splitWithList.innerHTML += `
        <label class="checkbox-item">
          <input type="checkbox" value="${friend}">
          <span>${friend}</span>
        </label>
      `
    })
  }

  showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.opacity = "0"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Comprehensive History Tracking
  addToHistory(type, data) {
    const historyEntry = {
      id: this.generateId(),
      type, // 'expense', 'settlement', 'edit', 'delete'
      timestamp: new Date().toISOString(),
      data: { ...data },
    }

    this.expenseHistory.unshift(historyEntry)
    this.saveToStorage("expenseHistory", this.expenseHistory)
  }

  // Partial Settlement Functions
  openPartialSettlement() {
    if (!this.currentSettlementFriend) return

    const friendName = this.currentSettlementFriend
    document.getElementById("settlementFriendName").textContent = friendName
    document.getElementById("partialSettlementTitle").textContent = `Settle Expenses with ${friendName}`

    this.selectedSettlementExpenses.clear()
    this.populateSettlementExpenses(friendName)
    this.updateSettlementTotals()

    document.getElementById("partialSettlementModal").style.display = "block"
  }

  populateSettlementExpenses(friendName) {
    const expensesList = document.getElementById("settlementExpensesList")

    // Get all unsettled expenses involving this friend
    const relevantExpenses = this.expenses.filter((expense) => {
      if (expense.settled) return false
      return expense.splitWith.includes(friendName) || expense.paidBy === friendName
    })

    if (relevantExpenses.length === 0) {
      expensesList.innerHTML = '<p class="no-data">No unsettled expenses found with this friend.</p>'
      return
    }

    const expenseItems = relevantExpenses
      .map((expense) => {
        const splitAmount = expense.amount / expense.splitWith.length
        let userAmount = 0
        let friendAmount = 0
        let description = ""
        let netAmount = 0

        if (expense.paidBy === "You" && expense.splitWith.includes(friendName)) {
          userAmount = splitAmount
          description = `You paid, ${friendName} owes ₹${splitAmount.toFixed(2)}`
          netAmount = splitAmount
        } else if (expense.paidBy === friendName && expense.splitWith.includes("You")) {
          friendAmount = splitAmount
          description = `${friendName} paid, you owe ₹${splitAmount.toFixed(2)}`
          netAmount = -splitAmount
        } else {
          return null
        }

        if (netAmount === 0) return null

        const isPositive = netAmount > 0
        const displayAmount = Math.abs(netAmount)
        const date = new Date(expense.date).toLocaleDateString()
        const categoryDisplay = expense.category.replace(/^[^\w\s]+\s*/, "")

        return `
            <div class="settlement-expense-item" data-expense-id="${expense.id}" data-amount="${netAmount}">
                <input type="checkbox" class="settlement-checkbox" onchange="toggleSettlementExpense('${expense.id}', ${netAmount})">
                <div class="settlement-expense-details">
                    <h4>${expense.title}</h4>
                    <div class="settlement-expense-meta">
                        <span>${date}</span>
                        <span class="separator">•</span>
                        <span>${categoryDisplay}</span>
                        <span class="separator">•</span>
                        <span>₹${expense.amount.toFixed(2)} total</span>
                        <span class="separator">•</span>
                        <span>${description}</span>
                    </div>
                </div>
                <div class="settlement-expense-amount ${isPositive ? "positive" : "negative"}">
                    ${isPositive ? "+" : "-"}₹${displayAmount.toFixed(2)}
                </div>
            </div>
        `
      })
      .filter((item) => item !== null)
      .join("")

    expensesList.innerHTML = expenseItems || '<p class="no-data">No relevant expenses found.</p>'
  }

  toggleSettlementExpense(expenseId, amount) {
    const checkbox = event.target
    const expenseItem = checkbox.closest(".settlement-expense-item")

    if (checkbox.checked) {
      this.selectedSettlementExpenses.add({ id: expenseId, amount })
      expenseItem.classList.add("selected")
    } else {
      this.selectedSettlementExpenses.delete([...this.selectedSettlementExpenses].find((item) => item.id === expenseId))
      expenseItem.classList.remove("selected")
    }

    this.updateSettlementTotals()
  }

  updateSettlementTotals() {
    const selectedAmount = [...this.selectedSettlementExpenses].reduce((total, item) => total + item.amount, 0)
    const netAmount = selectedAmount

    document.getElementById("selectedSettlementAmount").textContent = `₹${Math.abs(selectedAmount).toFixed(2)}`
    document.getElementById("netSettlementAmount").textContent =
      `${netAmount >= 0 ? "+" : "-"}₹${Math.abs(netAmount).toFixed(2)}`

    const confirmButton = document.getElementById("confirmPartialSettlement")
    confirmButton.disabled = this.selectedSettlementExpenses.size === 0

    // Update net amount color
    const netElement = document.getElementById("netSettlementAmount")
    netElement.className = `amount ${netAmount > 0 ? "positive" : netAmount < 0 ? "negative" : "neutral"}`
  }

  confirmPartialSettlement() {
    if (this.selectedSettlementExpenses.size === 0) return

    const friendName = this.currentSettlementFriend
    const selectedExpenses = [...this.selectedSettlementExpenses]
    const totalAmount = selectedExpenses.reduce((total, item) => total + item.amount, 0)

    if (
      confirm(
        `Settle ${selectedExpenses.length} expense(s) with ${friendName} for a net amount of ₹${Math.abs(totalAmount).toFixed(2)}?`,
      )
    ) {
      // Create settlement record
      const settlement = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        friendName,
        expenseIds: selectedExpenses.map((item) => item.id),
        totalAmount,
        type: "partial",
      }

      this.settlements.push(settlement)

      // Mark selected expenses as settled
      selectedExpenses.forEach((selectedExp) => {
        const expense = this.expenses.find((exp) => exp.id === selectedExp.id)
        if (expense) {
          expense.settled = true
          expense.settlementId = settlement.id
          expense.settlementDate = settlement.timestamp
        }
      })

      // Update balances
      this.balances[friendName] = (this.balances[friendName] || 0) - totalAmount

      // Add to history
      this.addToHistory("settlement", {
        friendName,
        amount: totalAmount,
        expenseCount: selectedExpenses.length,
        settlementType: "partial",
        expenseIds: selectedExpenses.map((item) => item.id),
      })

      // Save changes
      this.saveToStorage("expenses", this.expenses)
      this.saveToStorage("balances", this.balances)
      this.saveToStorage("settlements", this.settlements)

      // Update UI
      this.updateSummary()
      this.updateBalancesList()
      this.showBalanceDetails(friendName) // Refresh balance details
      this.closePartialSettlementModal()

      this.showNotification(`Settled ${selectedExpenses.length} expense(s) with ${friendName}!`)
    }
  }

  // Enhanced History Functions
  openExpenseHistoryModal() {
    this.populateHistoryFilters()
    this.filterExpenseHistory()
    document.getElementById("expenseHistoryModal").style.display = "block"
  }

  populateHistoryFilters() {
    const friendFilter = document.getElementById("historyFriendFilter")
    friendFilter.innerHTML = '<option value="all">All Friends</option>'
    this.friends.forEach((friend) => {
      friendFilter.innerHTML += `<option value="${friend}">${friend}</option>`
    })
  }

  filterExpenseHistory() {
    const typeFilter = document.getElementById("historyFilter").value
    const friendFilter = document.getElementById("historyFriendFilter").value
    const dateFilter = document.getElementById("historyDateFilter").value

    let filteredHistory = [...this.expenseHistory]

    // Filter by type
    if (typeFilter !== "all") {
      filteredHistory = filteredHistory.filter((item) => item.type === typeFilter)
    }

    // Filter by friend
    if (friendFilter !== "all") {
      filteredHistory = filteredHistory.filter((item) => {
        if (item.type === "expense" || item.type === "edit") {
          return item.data.splitWith?.includes(friendFilter) || item.data.paidBy === friendFilter
        } else if (item.type === "settlement") {
          return item.data.friendName === friendFilter
        }
        return true
      })
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "3months":
          filterDate.setMonth(now.getMonth() - 3)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filteredHistory = filteredHistory.filter((item) => new Date(item.timestamp) >= filterDate)
    }

    this.displayFilteredHistory(filteredHistory)
  }

  displayFilteredHistory(history) {
    const historyList = document.getElementById("expenseHistoryList")

    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-data">No history records found for the selected filters.</p>'
      return
    }

    const historyItems = history
      .map((item) => {
        const date = new Date(item.timestamp).toLocaleString()
        let content = ""

        switch (item.type) {
          case "expense":
            content = this.formatExpenseHistory(item, date)
            break
          case "settlement":
            content = this.formatSettlementHistory(item, date)
            break
          case "edit":
            content = this.formatEditHistory(item, date)
            break
          case "delete":
            content = this.formatDeleteHistory(item, date)
            break
        }

        return content
      })
      .join("")

    historyList.innerHTML = historyItems
  }

  formatExpenseHistory(item, date) {
    const data = item.data
    const splitInfo =
      data.splitWith?.length > 1
        ? `Split with ${data.splitWith.filter((p) => p !== data.paidBy).join(", ")}`
        : "Personal expense"

    return `
        <div class="history-item expense">
            <div class="history-header">
                <div>
                    <div class="history-title">${data.title}</div>
                    <span class="history-type expense">Expense</span>
                </div>
                <div class="history-amount neutral">₹${data.amount?.toFixed(2) || "0.00"}</div>
            </div>
            <div class="history-details">
                ${data.category?.replace(/^[^\w\s]+\s*/, "") || "Unknown"} • Paid by ${data.paidBy} • ${splitInfo}
            </div>
            <div class="history-meta">
                <span>${date}</span>
                <span class="settlement-status ${data.settled ? "settled" : "pending"}">
                    ${data.settled ? "Settled" : "Pending"}
                </span>
            </div>
        </div>
    `
  }

  formatSettlementHistory(item, date) {
    const data = item.data
    const amountClass = data.amount > 0 ? "positive" : data.amount < 0 ? "negative" : "neutral"
    const amountText =
      data.amount > 0
        ? `+₹${data.amount.toFixed(2)}`
        : data.amount < 0
          ? `-₹${Math.abs(data.amount).toFixed(2)}`
          : "₹0.00"

    return `
        <div class="history-item settlement">
            <div class="history-header">
                <div>
                    <div class="history-title">Settlement with ${data.friendName}</div>
                    <span class="history-type settlement">Settlement</span>
                </div>
                <div class="history-amount ${amountClass}">${amountText}</div>
            </div>
            <div class="history-details">
                ${data.settlementType === "partial" ? "Partial settlement" : "Full settlement"} • 
                ${data.expenseCount} expense(s) settled
            </div>
            <div class="history-meta">
                <span>${date}</span>
                <span class="settlement-status settled">Completed</span>
            </div>
        </div>
    `
  }

  formatEditHistory(item, date) {
    const data = item.data
    return `
        <div class="history-item edit">
            <div class="history-header">
                <div>
                    <div class="history-title">${data.title || "Expense Edit"}</div>
                    <span class="history-type edit">Edit</span>
                </div>
                <div class="history-amount neutral">Modified</div>
            </div>
            <div class="history-details">
                ${data.changes || "Expense details were modified"}
            </div>
            <div class="history-meta">
                <span>${date}</span>
                <span class="settlement-status partial">Modified</span>
            </div>
        </div>
    `
  }

  formatDeleteHistory(item, date) {
    const data = item.data
    return `
        <div class="history-item edit">
            <div class="history-header">
                <div>
                    <div class="history-title">${data.title || "Deleted Expense"}</div>
                    <span class="history-type edit">Delete</span>
                </div>
                <div class="history-amount negative">-₹${data.amount?.toFixed(2) || "0.00"}</div>
            </div>
            <div class="history-details">
                Expense was deleted • Originally paid by ${data.paidBy}
            </div>
            <div class="history-meta">
                <span>${date}</span>
                <span class="settlement-status settled">Deleted</span>
            </div>
        </div>
    `
  }

  exportHistory() {
    const historyData = {
      expenses: this.expenses,
      settlements: this.settlements,
      history: this.expenseHistory,
      friends: this.friends,
      balances: this.balances,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(historyData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `spendi-history-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    this.showNotification("History exported successfully!")
  }

  closeAllModals() {
    document.getElementById("expenseModal").style.display = "none"
    document.getElementById("friendModal").style.display = "none"
    document.getElementById("balanceModal").style.display = "none"
    document.getElementById("editExpenseModal").style.display = "none"
    document.getElementById("friendsManagementModal").style.display = "none"
    document.getElementById("partialSettlementModal").style.display = "none"
    document.getElementById("expenseHistoryModal").style.display = "none"
  }

  closeExpenseModal() {
    document.getElementById("expenseModal").style.display = "none"
  }

  closeFriendModal() {
    document.getElementById("friendModal").style.display = "none"
  }

  closeBalanceModal() {
    document.getElementById("balanceModal").style.display = "none"
  }

  closeEditExpenseModal() {
    document.getElementById("editExpenseModal").style.display = "none"
    this.currentEditingExpense = null
  }

  closeFriendsManagementModal() {
    document.getElementById("friendsManagementModal").style.display = "none"
  }

  closePartialSettlementModal() {
    document.getElementById("partialSettlementModal").style.display = "none"
    this.selectedSettlementExpenses.clear()
    this.currentSettlementFriend = null
  }

  closeExpenseHistoryModal() {
    document.getElementById("expenseHistoryModal").style.display = "none"
  }
}

// Global functions for modal controls
function openExpenseModal() {
  document.getElementById("expenseModal").style.display = "block"
}

function closeExpenseModal() {
  app.closeExpenseModal()
}

function openFriendModal() {
  document.getElementById("friendModal").style.display = "block"
}

function closeFriendModal() {
  app.closeFriendModal()
}

function openFriendsManagementModal() {
  app.updateFriendsManagementList()
  document.getElementById("friendsManagementModal").style.display = "block"
}

function closeFriendsManagementModal() {
  app.closeFriendsManagementModal()
}

function toggleTheme() {
  app.toggleTheme()
}

function showBalanceDetails(friendName) {
  app.showBalanceDetails(friendName)
}

function closeBalanceModal() {
  app.closeBalanceModal()
}

function editExpense(expenseId) {
  app.editExpense(expenseId)
}

function closeEditExpenseModal() {
  app.closeEditExpenseModal()
}

function deleteExpense() {
  app.deleteExpense()
}

function removeFriend(friendName) {
  app.removeFriend(friendName)
}

function settleBalance() {
  // This will be handled by the onclick set in showBalanceDetails
}

function openPartialSettlement() {
  app.openPartialSettlement()
}

function closePartialSettlementModal() {
  app.closePartialSettlementModal()
}

function toggleSettlementExpense(expenseId, amount) {
  app.toggleSettlementExpense(expenseId, amount)
}

function confirmPartialSettlement() {
  app.confirmPartialSettlement()
}

function openExpenseHistoryModal() {
  app.openExpenseHistoryModal()
}

function closeExpenseHistoryModal() {
  app.closeExpenseHistoryModal()
}

function filterExpenseHistory() {
  app.filterExpenseHistory()
}

function exportHistory() {
  app.exportHistory()
}

// Initialize app when DOM is loaded
let app
document.addEventListener("DOMContentLoaded", () => {
  app = new SpendiApp()
})

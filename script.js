// Initialize storage and data
let users = JSON.parse(localStorage.getItem('joyFeastUsers')) || [];
let foodDonations = JSON.parse(localStorage.getItem('joyFeastDonations')) || [];
let donationHistory = JSON.parse(localStorage.getItem('joyFeastHistory')) || [];
let notifications = JSON.parse(localStorage.getItem('joyFeastNotifications')) || [];
let currentUser = JSON.parse(localStorage.getItem('joyFeastCurrentUser')) || null;

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const heroSignupBtn = document.getElementById('heroSignupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const roleModal = document.getElementById('roleModal');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const closeModals = document.querySelectorAll('.close-modal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const roleOptions = document.querySelectorAll('.role-option');
const confirmRole = document.getElementById('confirmRole');
const dashboard = document.getElementById('dashboard');
const donorDashboard = document.getElementById('donorDashboard');
const receiverDashboard = document.getElementById('receiverDashboard');
const foodDonationForm = document.getElementById('foodDonationForm');
const donorFoodList = document.getElementById('donorFoodList');
const receiverFoodList = document.getElementById('receiverFoodList');
const searchFood = document.getElementById('searchFood');
const filterFood = document.getElementById('filterFood');
const notification = document.getElementById('notification');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const donationHistoryList = document.getElementById('donationHistoryList');
const topDonorsGrid = document.getElementById('topDonorsGrid');
const totalMealsSaved = document.getElementById('totalMealsSaved');
const totalDonors = document.getElementById('totalDonors');
const totalReceivers = document.getElementById('totalReceivers');
const co2Reduced = document.getElementById('co2Reduced');
const notificationBell = document.getElementById('notificationBell');
const notificationCount = document.getElementById('notificationCount');
const notificationPanel = document.getElementById('notificationPanel');
const notificationList = document.getElementById('notificationList');
const markAllRead = document.getElementById('markAllRead');

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
  updateUI();
  loadFoodDonations();
  loadDonationHistory();
  updateStats();
  loadTopDonors();
  loadNotifications();

  // Sample data for first load
  if (foodDonations.length === 0) {
    const sampleDonations = [
      {
        id: 1,
        donorId: 'sample',
        foodType: 'Vegetarian',
        quantity: '10 plates',
        address: '123 Main St, City Center',
        expiryDate: '2025-12-15',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
        status: 'available',
        donorName: 'Green Restaurant',
        donorPhone: '+1 555-1234'
      }
    ];
    foodDonations = sampleDonations;
    localStorage.setItem('joyFeastDonations', JSON.stringify(foodDonations));
  }
});

// Show/Hide Modals
function showModal(modal) {
  modal.classList.add('show');
}
function hideModal(modal) {
  modal.classList.remove('show');
}

// Notifications
function showNotification(message, type = 'success') {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Auth
loginBtn.addEventListener('click', () => showModal(loginModal));
signupBtn.addEventListener('click', () => showModal(signupModal));
heroSignupBtn.addEventListener('click', () => showModal(signupModal));
logoutBtn.addEventListener('click', logout);

showSignup.addEventListener('click', (e) => {
  e.preventDefault();
  hideModal(loginModal);
  showModal(signupModal);
});
showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  hideModal(signupModal);
  showModal(loginModal);
});
closeModals.forEach(btn => {
  btn.addEventListener('click', () => {
    hideModal(loginModal);
    hideModal(signupModal);
    hideModal(roleModal);
  });
});

window.addEventListener('click', (e) => {
  if (e.target === loginModal) hideModal(loginModal);
  if (e.target === signupModal) hideModal(signupModal);
  if (e.target === roleModal) hideModal(roleModal);
});

// Signup/Login
loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    if (user.verified) {
      currentUser = user;
      localStorage.setItem('joyFeastCurrentUser', JSON.stringify(currentUser));
      hideModal(loginModal);
      updateUI();
      showNotification('Login successful!', 'success');
    } else {
      showNotification('Please verify your email.', 'error');
    }
  } else {
    showNotification('Invalid credentials.', 'error');
  }
}

function handleSignup(e) {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const phone = document.getElementById('signupPhone').value;
  const password = document.getElementById('signupPassword').value;

  if (users.find(u => u.email === email)) {
    showNotification('User already exists.', 'error');
    return;
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    phone,
    password,
    verified: false,
    role: null,
    donationsCount: 0,
    totalQuantity: 0
  };

  users.push(newUser);
  localStorage.setItem('joyFeastUsers', JSON.stringify(users));
  currentUser = newUser;
  localStorage.setItem('joyFeastCurrentUser', JSON.stringify(currentUser));
  hideModal(signupModal);
  showModal(roleModal);
  showNotification('Account created. Please verify email.', 'success');
}

roleOptions.forEach(option => {
  option.addEventListener('click', () => {
    roleOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    confirmRole.disabled = false;
  });
});
confirmRole.addEventListener('click', confirmUserRole);

function confirmUserRole() {
  const selectedRole = document.querySelector('.role-option.selected').dataset.role;
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex].role = selectedRole;
    users[userIndex].verified = true;
    localStorage.setItem('joyFeastUsers', JSON.stringify(users));
    currentUser = users[userIndex];
    localStorage.setItem('joyFeastCurrentUser', JSON.stringify(currentUser));
  }
  hideModal(roleModal);
  updateUI();
  showNotification(`Welcome as a ${selectedRole}!`, 'success');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('joyFeastCurrentUser');
  updateUI();
  showNotification('Logged out.', 'success');
}

// UI Updates
function updateUI() {
  if (currentUser) {
    loginBtn.classList.add('hidden');
    signupBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    dashboard.classList.remove('hidden');
    notificationBell.classList.remove('hidden');
    if (currentUser.role === 'donor') {
      donorDashboard.classList.remove('hidden');
      receiverDashboard.classList.add('hidden');
    } else {
      donorDashboard.classList.add('hidden');
      receiverDashboard.classList.remove('hidden');
    }
  } else {
    loginBtn.classList.remove('hidden');
    signupBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    dashboard.classList.add('hidden');
    notificationBell.classList.add('hidden');
  }
}

// Donations
function handleFoodDonation(e) {
  e.preventDefault();
  const foodType = document.getElementById('foodType').value;
  const quantity = document.getElementById('foodQuantity').value;
  const address = document.getElementById('foodAddress').value;
  const expiryDate = document.getElementById('expiryDate').value;
  const imageInput = document.getElementById('foodImage');

  if (!foodType || !quantity || !address || !expiryDate) {
    showNotification('All fields are required.', 'error');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  if (expiryDate < today) {
    showNotification('Expiry date must be future.', 'error');
    return;
  }

  const newDonation = {
    id: Date.now(),
    donorId: currentUser.id,
    foodType,
    quantity,
    address,
    expiryDate,
    image: imageInput.files.length > 0 ? URL.createObjectURL(imageInput.files[0]) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
    status: 'available',
    donorName: currentUser.username,
    donorPhone: currentUser.phone
  };

  foodDonations.push(newDonation);
  localStorage.setItem('joyFeastDonations', JSON.stringify(foodDonations));
  showNotification('Donation shared successfully!', 'success');
  loadFoodDonations();
}

// Load Data
function loadFoodDonations() {
  const today = new Date().toISOString().split('T')[0];
  foodDonations.forEach(donation => {
    if (donation.status !== 'requested') {
      donation.status = donation.expiryDate < today ? 'outdated' : 'available';
    }
  });
  localStorage.setItem('joyFeastDonations', JSON.stringify(foodDonations));
}

function loadDonationHistory() {
  if (!currentUser) return;
  donationHistoryList.innerHTML = '';
  const userHistory = donationHistory.filter(h =>
    currentUser.role === 'donor' ? h.donorId === currentUser.id : h.receiverId === currentUser.id
  );

  if (userHistory.length === 0) {
    donationHistoryList.innerHTML = '<p>No donation history found.</p>';
  } else {
    userHistory.forEach(h => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<div class="history-info"><h4>${h.foodType}</h4><p>${h.quantity}</p></div>`;
      donationHistoryList.appendChild(div);
    });
  }
}

// Stats
function updateStats() {
  let totalMeals = 0;
  donationHistory.forEach(h => {
    if (h.status === 'completed') {
      totalMeals += parseInt(h.quantity) || 0;
    }
  });
  totalMealsSaved.textContent = totalMeals;
  totalDonors.textContent = users.filter(u => u.role === 'donor' && u.verified).length;
  totalReceivers.textContent = users.filter(u => u.role === 'receiver' && u.verified).length;
  co2Reduced.textContent = (totalMeals * 2.5).toLocaleString();
}

// Top Donors
function loadTopDonors() {
  topDonorsGrid.innerHTML = '';
  const donors = users.filter(u => u.role === 'donor' && u.verified);
  donors.sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0));
  const top3 = donors.slice(0, 3);
  if (top3.length === 0) {
    topDonorsGrid.innerHTML = '<p>No donors yet.</p>';
    return;
  }
  top3.forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'donor-card';
    card.innerHTML = `
      <div class="donor-avatar"><i class="fas fa-user"></i></div>
      <div class="donor-rank">Top ${i + 1}</div>
      <h3>${d.username}</h3>
      <div class="donor-stats">
        <div><h4>${d.donationsCount}</h4><p>Donations</p></div>
        <div><h4>${d.totalQuantity}</h4><p>Meals</p></div>
      </div>`;
    topDonorsGrid.appendChild(card);
  });
}

// Notifications
function loadNotifications() {
  if (!currentUser) return;
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;
  notificationCount.textContent = unreadCount;
  notificationList.innerHTML = '';
  if (userNotifications.length === 0) {
    notificationList.innerHTML = '<p style="padding:15px;text-align:center;">No notifications</p>';
    return;
  }
  userNotifications.forEach(n => {
    const div = document.createElement('div');
    div.className = `notification-item ${n.read ? '' : 'unread'}`;
    div.innerHTML = `<p><strong>${n.title}</strong></p><p>${n.message}</p>`;
    div.addEventListener('click', () => {
      n.read = true;
      localStorage.setItem('joyFeastNotifications', JSON.stringify(notifications));
      loadNotifications();
    });
    notificationList.appendChild(div);
  });
}

markAllRead.addEventListener('click', () => {
  notifications.forEach(n => {
    if (n.userId === currentUser.id) n.read = true;
  });
  localStorage.setItem('joyFeastNotifications', JSON.stringify(notifications));
  loadNotifications();
});

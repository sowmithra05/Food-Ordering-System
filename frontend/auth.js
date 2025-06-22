// auth.js - Frontend authentication functions

// Check if user is logged in
const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };
  
  // Update UI based on authentication status
  const updateAuthUI = () => {
    const loginLinks = document.querySelectorAll('.login-link');
    const logoutLinks = document.querySelectorAll('.logout-link');
    const profileLinks = document.querySelectorAll('.profile-link');
    
    if (isLoggedIn()) {
      // User is logged in
      loginLinks.forEach(link => link.style.display = 'none');
      logoutLinks.forEach(link => link.style.display = 'inline-block');
      profileLinks.forEach(link => link.style.display = 'inline-block');
      
      // Get user data and update profile elements
      const userData = JSON.parse(localStorage.getItem('user'));
      const userNameElements = document.querySelectorAll('.user-name');
      if (userData && userNameElements) {
        userNameElements.forEach(el => el.textContent = userData.name);
      }
    } else {
      // User is logged out
      loginLinks.forEach(link => link.style.display = 'inline-block');
      logoutLinks.forEach(link => link.style.display = 'none');
      profileLinks.forEach(link => link.style.display = 'none');
    }
  };
  
  // Register form handler
  document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Registration successful! Please log in.");
        window.location.href = "/login.html";
      } else {
        alert(data);
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
      console.error(err);
    }
  });
  
  // Login form handler
  document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert("Login successful!");
        window.location.href = "/index.html";
      } else {
        alert(data);
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
      console.error(err);
    }
  });
  
  // Updated logout function to call server API
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call the server logout endpoint
      const res = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include" // Important for cookies
      });
      
      // Clear client-side storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      
      return res.ok;
    } catch (err) {
      console.error("Logout error:", err);
      // Even if server call fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      return false;
    }
  };
  
  // Initialize auth UI when page loads
  document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // Handle logout on the logout page
    if (window.location.pathname.includes('logout.html')) {
      const loggingOutElement = document.getElementById('loggingOut');
      const loggedOutElement = document.getElementById('loggedOut');
      
      if (loggingOutElement && loggedOutElement) {
        logout().then(success => {
          setTimeout(() => {
            loggingOutElement.classList.add('hidden');
            loggedOutElement.classList.remove('hidden');
          }, 2000);
        });
      }
    }
  });
  
  // Export functions for use in other scripts
  export { isLoggedIn, updateAuthUI, logout };
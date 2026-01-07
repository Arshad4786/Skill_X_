import axios from "axios";

// 1. The "Base" API Client
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 2. The Axios Interceptor (Adds auth token to all requests)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("skillx_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// === 3. AUTHENTICATION FUNCTIONS ===
// (Matches your routes/auth.js)

export const login = async (credentials) => {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);
    if (data.token) {
      localStorage.setItem("skillx_token", data.token);
    }
    return { success: true, data };
  } catch (error) {
    const message = error.response?.data?.error || "Login failed";
    return { success: false, error: message };
  }
};

export const registerTalent = async (userData) => {
  try {
    const { data } = await apiClient.post("/auth/register/talent", userData);
    if (data.token) {
      localStorage.setItem("skillx_token", data.token);
    }
    return { success: true, data };
  } catch (error) {
    const message = error.response?.data?.error || "Registration failed";
    return { success: false, error: message };
  }
};

// (Needed for your app/client/signup/page.tsx)
export const registerClient = async (userData) => {
  try {
    const { data } = await apiClient.post("/auth/register/client", userData);
    if (data.token) {
      localStorage.setItem("skillx_token", data.token);
    }
    return { success: true, data };
  } catch (error) {
    const message = error.response?.data?.error || "Registration failed";
    return { success: false, error: message };
  }
};

export const logout = () => {
  localStorage.removeItem("skillx_token");
  window.location.href = '/'; // Go to homepage
};

export const getMe = async () => {
  try {
    const { data } = await apiClient.get("/auth/me");
    return { success: true, data };
  } catch (error) {
    const message = error.response?.data?.error || "Could not fetch user";
    return { success: false, error: message };
  }
};


// === 4. TALENT & PROFILE FUNCTIONS ===
// (Matches your routes/talent.js)

export const getMyProfile = async () => {
  try {
    const { data } = await apiClient.get("/talent/profile");
    return { success: true, profile: data.talent, completion: data.profileCompletion };
  } catch (error){
    const message = error.response?.data?.error || "Could not fetch profile";
    return { success: false, error: message };
  }
};

export const getAllTalent = async () => {
  try {
    const { data } = await apiClient.get("/talent/all-approved");
    return { success: true, talents: data.talents };
  } catch (error) {
    console.error("Could not fetch talent:", error);
    return { success: false, talents: [] };
  }
};

export const updateTalentProfile = async (profileData) => {
  try {
    const { data } = await apiClient.put("/talent/profile", profileData);
    return { success: true, data: data };
  } catch (error) {
    const message = error.response?.data?.error || "Profile update failed.";
    return { success: false, error: message };
  }
};

export const submitForReview = async () => {
  try {
    const { data } = await apiClient.post("/talent/submit-for-review");
    return { success: true, data: data };
  } catch (error) {
    const message = error.response?.data?.error || "Submission failed.";
    return { success: false, error: message };
  }
};

// --- THIS IS THE NEW FUNCTION ---
/**
 * Calls the backend to calculate the SkillX Score
 * Calls POST /api/talent/calculate-skillx-score
 */
export const calculateSkillxScore = async () => {
  try {
    const { data } = await apiClient.post("/talent/calculate-skillx-score");
    return { success: true, score: data.skillxScore, metrics: data.metrics };
  } catch (error) {
    const message = error.response?.data?.error || "Score calculation failed.";
    return { success: false, error: message };
  }
};
// ---------------------------------


// === 5. ADMIN FUNCTIONS ===
// (Matches your routes/admin.js)

export const getAdminStats = async () => {
  try {
    const { data } = await apiClient.get("/admin/stats");
    return { success: true, stats: data.stats };
  } catch (error) {
    const message = error.response?.data?.error || "Could not fetch admin stats";
    return { success: false, error: message };
  }
};

export const getPendingTalents = async (searchTerm = "") => {
  try {
    const { data } = await apiClient.get(`/admin/pending-talents?search=${searchTerm}`);
    return { success: true, talents: data.talents };
  } catch (error) {
    const message = error.response?.data?.error || "Could not fetch pending talents";
    return { success: false, error: message, talents: [] };
  }
};

export const getAdminHireRequests = async (status = "") => {
  try {
    const { data } = await apiClient.get(`/admin/hire-requests?status=${status}`);
    return { success: true, hireRequests: data.hireRequests };
  } catch (error) {
    const message = error.response?.data?.error || "Could not fetch hire requests";
    return { success: false, error: message, hireRequests: [] };
  }
};

export const approveTalent = async (talentId) => {
  try {
    const { data } = await apiClient.post(`/admin/approve-talent/${talentId}`);
    return { success: true, data: data };
  } catch (error) {
    const message = error.response?.data?.error || "Approval failed";
    return { success: false, error: message };
  }
};

export const rejectTalent = async (talentId, reason) => {
  try {
    if (!reason) {
      return { success: false, error: "Rejection reason is required." };
    }
    const { data } = await apiClient.post(`/admin/reject-talent/${talentId}`, { reason });
    return { success: true, data: data };
  } catch (error) {
    const message = error.response?.data?.error || "Rejection failed";
    return { success: false, error: message };
  }
};

// === 6. CLIENT & PUBLIC TALENT FUNCTIONS ===
// (Matches your routes/client.js)

export const searchTalents = async (params) => {
  try {
    const { data } = await apiClient.get("/client/talents/search", { params });
    return { success: true, data: data }; // Returns { talents, pagination }
  } catch (error) {
    const message = error.response?.data?.error || "Failed to search talents";
    return { success: false, error: message, data: { talents: [], pagination: {} } };
  }
};

export const getTalentById = async (talentId) => {
  try {
    const { data } = await apiClient.get(`/client/talents/${talentId}`);
    return { success: true, talent: data.talent };
  } catch (error) {
    const message = error.response?.data?.error || "Failed to get talent profile";
    return { success: false, error: message };
  }
};

export const addFavorite = async (talentId) => {
  try {
    const { data } = await apiClient.post(`/client/favorites/${talentId}`);
    return { success: true, data: data };
  } catch (error) {
    const message = error.response?.data?.error || "Failed to add favorite";
    return { success: false, error: message };
  }
};

export const removeFavorite = async (talentId) => {
  try {
    const { data } = await apiClient.delete(`/client/favorites/${talentId}`);
    return { success: true, data: data };
  } catch (error) {
    const message = error.response?.data?.error || "Failed to remove favorite";
    return { success: false, error: message };
  }
};

export const getMyFavorites = async () => {
  try {
    const { data } = await apiClient.get("/client/favorites");
    return { success: true, favorites: data.favorites };
  } catch (error) {
    const message = error.response?.data?.error || "Failed to get favorites";
    return { success: false, error: message, favorites: [] };
  }
};

export const sendHireRequest = async (hireData) => {
  try {
    const { data } = await apiClient.post("/client/hire-requests", hireData);
    return { success: true, data: data };
  } catch (error) {
    const message = error.response?.data?.error || "Failed to send hire request";
    return { success: false, error: message };
  }
};

export const getMyHireRequests = async () => {
  try {
    const { data } = await apiClient.get("/client/hire-requests");
    return { success: true, hireRequests: data.hireRequests };
  } catch (error) {
    const message = error.response?.data?.error || "Failed to get hire requests";
    return { success: false, error: message, hireRequests: [] };
  }
};

// NEW: Added function from routes/admin.js that was missing
export const getAdminHireRequestById = async (requestId) => {
  try {
    const { data } = await apiClient.get(`/admin/hire-requests/${requestId}`);
    return { success: true, hireRequest: data.hireRequest };
  } catch (error) {
    const message = error.response?.data?.error || "Failed to get hire request details";
    return { success: false, error: message };
  }
};


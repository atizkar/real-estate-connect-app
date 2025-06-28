import React, { useState, useEffect, createContext, useContext } from 'react';
// Tailwind CSS is already configured in the project

// Context for User state (Firebase context removed)
const UserContext = createContext(null);

// Main App Component
function App() {
  const [view, setView] = useState('home');
  // New state for user management, replacing Firebase auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // To store user data from Laravel
  const [loadingUser, setLoadingUser] = useState(true); // To check if user status is loaded

  // Mock function to check initial login status from backend
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoadingUser(true);
        // In a real app, this would hit a Laravel endpoint like /api/user
        // to check if authenticated and fetch user data.
        // For Laravel Sanctum, you might make a request and check if it returns 200 OK
        // or a user object. Initial state will be false, then set to true on successful login.

        // Simulate an API call to check auth status and fetch user data
        const response = await fetch('/api/user', {
            // For Sanctum, you might need to include credentials to send the cookie
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            setIsLoggedIn(true);
            setUser(data); // Assuming Laravel returns user object on success
        } else {
            setIsLoggedIn(false);
            setUser(null);
            console.log("No active user session found on backend.");
        }
      } catch (error) {
        console.error("Failed to check login status from backend:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for sending/receiving cookies with Sanctum
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setUser(data.user); // Assuming Laravel login returns user data
        // If using Sanctum API tokens: localStorage.setItem('authToken', data.token);
        return { success: true, message: "Logged in successfully!" };
      } else {
        return { success: false, message: data.message || "Login failed." };
      }
    } catch (error) {
      console.error("Login API call failed:", error);
      return { success: false, message: "Network error or server unreachable." };
    }
  };

  // Register handler
  const handleRegister = async (name, email, password) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include' // Important for sending/receiving cookies with Sanctum
      });

      const data = await response.json();

      if (response.ok) {
        // After successful registration, you might want to automatically log them in
        // or redirect to a login page. For now, simulate login.
        setIsLoggedIn(true);
        setUser(data.user); // Assuming registration returns user data
        return { success: true, message: "Registered and logged in successfully!" };
      } else {
        return { success: false, message: data.message || "Registration failed." };
      }
    } catch (error) {
      console.error("Register API call failed:", error);
      return { success: false, message: "Network error or server unreachable." };
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Important for sending cookie to invalidate session
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        // If using Sanctum API tokens: localStorage.removeItem('authToken');
        console.log("Logged out successfully.");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  };


  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold text-gray-700">Loading application...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing user session.</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ isLoggedIn, user, handleLogin, handleRegister, handleLogout }}>
      <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
        {/* Navigation Bar */}
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg">
          <div className="container mx-auto flex flex-wrap justify-between items-center">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              RealEstateConnect
            </h1>
            <div className="flex flex-wrap gap-2 md:gap-4 mt-2 md:mt-0">
              <NavButton label="Home" onClick={() => setView('home')} currentView={view} targetView="home" />
              <NavButton label="Buyers" onClick={() => setView('buyer')} currentView={view} targetView="buyer" />
              <NavButton label="Investors" onClick={() => setView('investor')} currentView={view} targetView="investor" />
              <NavButton label="Agents" onClick={() => setView('agent')} currentView={view} targetView="agent" />
              <NavButton label="Vendors" onClick={() => setView('vendor')} currentView={view} targetView="vendor" />
              <NavButton label="Developers" onClick={() => setView('developer')} currentView={view} targetView="developer" />
              {isLoggedIn ? (
                <NavButton label="Logout" onClick={handleLogout} currentView={view} targetView="logout" />
              ) : (
                <NavButton label="Login / Register" onClick={() => setView('auth')} currentView={view} targetView="auth" />
              )}
            </div>
            {isLoggedIn && user && (
              <div className="text-white text-sm mt-2 md:mt-0 p-2 bg-blue-700 rounded-md shadow-inner">
                Welcome, <span className="font-mono break-all">{user.name || user.email || 'User'}</span>!
              </div>
            )}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="container mx-auto p-4 flex-grow">
          {view === 'home' && <Home />}
          {view === 'buyer' && <BuyerDashboard />}
          {view === 'investor' && <InvestorDashboard />}
          {view === 'agent' && <AgentDashboard />}
          {view === 'vendor' && <VendorDashboard />}
          {view === 'developer' && <DeveloperDashboard />}
          {view === 'auth' && <AuthPage />}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center p-4 text-sm mt-8">
          <div className="container mx-auto">
            © 2025 RealEstateConnect. All rights reserved. Your trusted real estate partner.
          </div>
        </footer>
      </div>
    </UserContext.Provider>
  );
}

// Reusable Navigation Button Component
const NavButton = ({ label, onClick, currentView, targetView }) => {
  const isActive = currentView === targetView;
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition-all duration-300 ease-in-out
        ${isActive ? 'bg-white text-blue-700 shadow-md transform scale-105' : 'text-white hover:bg-blue-500 hover:scale-105'}
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
    >
      {label}
    </button>
  );
};

// Home Component
const Home = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-3xl mx-auto my-8">
      <h2 className="text-4xl font-extrabold text-blue-800 mb-6">Welcome to RealEstateConnect!</h2>
      <p className="text-lg text-gray-700 leading-relaxed mb-4">
        Your ultimate platform for all real estate needs. Whether you're buying your first home,
        investing in properties, an agent connecting with clients, a vendor selling, or a developer
        seeking insights, we've got you covered.
      </p>
      <p className="text-md text-gray-600">
        Navigate through the options above to explore tailored features for your role.
      </p>
    </div>
  );
};

// Authentication Page (Login/Register)
const AuthPage = () => {
  const { handleLogin, handleRegister } = useContext(UserContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage('');
    setMessageType('');

    let result;
    if (isRegistering) {
      result = await handleRegister(name, email, password);
    } else {
      result = await handleLogin(email, password);
    }

    setAuthMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center border-b pb-3">
        {isRegistering ? 'Register' : 'Login'}
      </h2>

      {authMessage && (
        <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {authMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <InputGroup label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <InputGroup label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <InputGroup label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-blue-600 hover:underline focus:outline-none"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
};


// Buyer Dashboard Component
const BuyerDashboard = () => {
  const { user, isLoggedIn } = useContext(UserContext);
  const [preferences, setPreferences] = useState({
    location: '',
    propertyType: '',
    budget: '',
    lifestyle: '',
  });
  const [aiResponse, setAiResponse] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);


  // Load preferences from Laravel backend
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!isLoggedIn || !user || !user.id) { // Ensure user and user.id exist
        setIsLoadingPreferences(false);
        return;
      }
      try {
        setIsLoadingPreferences(true);
        // Example API endpoint: /api/user/preferences (Laravel will handle user ID from auth)
        // Or /api/users/${user.id}/preferences if you prefer ID in URL (requires appropriate Laravel route)
        const response = await fetch(`/api/user/preferences`, {
          credentials: 'include', // Important for sending cookies with Sanctum
          // If using API tokens: headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPreferences(data.preferences || {}); // Assuming preferences are nested under 'preferences' key
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch preferences:", errorText);
          setMessage("Error loading preferences from backend.");
          setMessageType('error');
        }
      } catch (error) {
        console.error("Network error fetching preferences:", error);
        setMessage("Network error loading preferences. Please check backend.");
        setMessageType('error');
      } finally {
        setIsLoadingPreferences(false);
      }
    };
    fetchPreferences();
  }, [isLoggedIn, user]); // Re-fetch when login status or user changes

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const savePreferences = async () => {
    if (!isLoggedIn || !user || !user.id) {
      setMessage("Please log in to save preferences.");
      setMessageType('error');
      return;
    }
    try {
      // Example API endpoint: /api/user/preferences
      const response = await fetch(`/api/user/preferences`, {
        method: 'POST', // Or PUT/PATCH depending on your API design
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.api_token ? `Bearer ${user.api_token}` : undefined, // If using API tokens
          // For Sanctum cookie-based: credentials: 'include' handled automatically by browser on same-origin POST
        },
        body: JSON.stringify(preferences),
      });
      if (response.ok) {
        setMessage("Preferences saved successfully!");
        setMessageType('success');
      } else {
        const errorText = await response.text();
        console.error("Failed to save preferences:", errorText);
        setMessage("Failed to save preferences to backend.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Network error saving preferences:", error);
      setMessage("Network error saving preferences. Please check backend.");
      setMessageType('error');
    }
  };

  const getAIRecommendation = async () => {
    if (!aiPrompt.trim()) {
      setAiResponse("Please enter a prompt for the AI recommendation.");
      return;
    }
    if (!isLoggedIn) { // Only allow AI if logged in
      setMessage("Please log in to use AI recommendations.");
      setMessageType('error');
      return;
    }

    setIsLoadingAI(true);
    setAiResponse('');
    setMessage('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 60 seconds

    try {
      const apiUrl = `/llm-api/v1/chat/completions`; // This hits Nginx, which proxies to LLM Studio

      const payload = {
        model: "default-model",
        messages: [
          { role: "system", content: "You are a helpful real estate assistant. Provide concise and relevant suburb suggestions based on user preferences. Avoid specific financial advice or guaranteeing outcomes." },
          { role: "user", content: `Based on these preferences: Location: ${preferences.location || 'N/A'}, Property Type: ${preferences.propertyType || 'N/A'}, Budget: ${preferences.budget || 'N/A'}, Lifestyle: ${preferences.lifestyle || 'N/A'}. User's specific request: "${aiPrompt}". Suggest suitable suburbs and reasons.` }
        ],
        temperature: 0.7,
        max_tokens: 500,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = await response.text();
        try {
          errorData = JSON.parse(errorData);
        } catch (e) { }
        console.error(`LLM Studio API (HTTP Error ${response.status} ${response.statusText}):`, errorData);
        setMessage(`LLM Studio API Error: ${response.status} ${response.statusText}. Details: ${typeof errorData === 'object' ? (errorData.error?.message || JSON.stringify(errorData)) : errorData}`);
        setMessageType('error');
        setAiResponse("Failed to get AI recommendation. Please check console for details.");
        return;
      }

      const result = await response.json();

      if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
        const text = result.choices[0].message.content;
        setAiResponse(text);
        setMessage("AI recommendation generated!");
        setMessageType('success');
      } else {
        console.error("LLM Studio response structure unexpected:", result);
        setAiResponse("Failed to get AI recommendation from LLM Studio. Unexpected response structure.");
        setMessage("Failed to get AI recommendation from LLM Studio. Please check LLM Studio logs and console.");
        setMessageType('error');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error calling LLM Studio API via proxy:", error);
      if (error.name === 'AbortError') {
        setMessage("AI recommendation request timed out. LLM Studio might be slow or unreachable.");
        setAiResponse("Request timed out. Please try again or check LLM Studio's performance.");
      } else if (error instanceof TypeError) {
        setMessage("Network error: Could not connect to LLM Studio proxy. Is Docker running and Nginx configured correctly?");
        setAiResponse("Network error. Please check Docker and LLM Studio's availability.");
      } else {
        setMessage("An unexpected error occurred while fetching AI recommendation.");
        setAiResponse("An unexpected error occurred. Please check console for details.");
      }
      setMessageType('error');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Buyer Dashboard</h2>

      {message && (
        <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Preferences</h3>
        {!isLoggedIn ? (
            <p className="text-red-600 mb-4">Please log in to manage your preferences.</p>
        ) : isLoadingPreferences ? (
          <p className="text-gray-600">Loading preferences...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Desired Location (e.g., 'Downtown', 'Suburbia')" name="location" value={preferences.location} onChange={handlePreferenceChange} disabled={!isLoggedIn} />
            <InputGroup label="Property Type (e.g., 'House', 'Apartment', 'Townhouse')" name="propertyType" value={preferences.propertyType} onChange={handlePreferenceChange} disabled={!isLoggedIn} />
            <InputGroup label="Budget (e.g., '$500,000 - $700,000')" name="budget" value={preferences.budget} onChange={handlePreferenceChange} disabled={!isLoggedIn} />
            <InputGroup label="Lifestyle (e.g., 'Family-friendly', 'Nightlife', 'Quiet')" name="lifestyle" value={preferences.lifestyle} onChange={handlePreferenceChange} disabled={!isLoggedIn} />
          </div>
        )}
        <button
          onClick={savePreferences}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isLoggedIn || isLoadingPreferences}
        >
          Save Preferences
        </button>
      </div>

      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">AI-Powered Suburb Suggestions ✨</h3>
        <p className="text-gray-700 mb-4">
          Describe what you're looking for, and our AI will suggest suitable suburbs and insights based on your preferences.
        </p>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-y min-h-[100px]"
          placeholder="e.g., 'Find me a 3-bedroom house with a big yard for a family, good schools nearby, and easy access to public transport.'"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          disabled={isLoadingAI || !isLoggedIn}
        ></textarea>
        <button
          onClick={getAIRecommendation}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoadingAI || !isLoggedIn}
        >
          {isLoadingAI ? 'Generating...' : 'Get AI Suggestion ✨'}
        </button>
        {isLoadingAI && (
          <div className="mt-4 text-center text-blue-700 font-medium">
            <svg className="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Thinking...
          </div>
        )}
        {aiResponse && (
          <div className="mt-6 p-4 bg-white border border-blue-200 rounded-md shadow-sm whitespace-pre-wrap">
            <h4 className="font-semibold text-blue-700 mb-2">AI Response:</h4>
            <p className="text-gray-800">{aiResponse}</p>
          </div>
        )}
      </div>

      {/* Suburb Heatmaps (Placeholder - for future development) */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Suburb Heatmaps (To Be Developed)</h3>
        <p className="text-gray-700">
          This section would display interactive heatmaps showing preferences, amenities, and growth potential
          for different suburbs based on your criteria. This will be integrated with the Laravel backend.
        </p>
        <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-lg border border-dashed border-gray-400">
          [Interactive Map with Heatmap Overlay Placeholder]
        </div>
      </div>

      {/* Property Listings (Placeholder) */}
      <div className="p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Available Properties (To Be Developed with Backend)</h3>
        <p className="text-gray-700 mb-4">
          Here you would see property listings filtered by your preferences and AI recommendations, fetched from the Laravel backend.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Property Cards */}
          <PropertyCard title="Spacious Family Home" location="Maplewood" price="$650,000" />
          <PropertyCard title="Modern City Apartment" location="Downtown" price="$480,000" />
          <PropertyCard title="Cozy Townhouse" location="Greenview" price="$550,000" />
        </div>
      </div>
    </div>
  );
};

const InvestorDashboard = () => {
  const { user, isLoggedIn } = useContext(UserContext);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState('');
  const [strategySuggestion, setStrategySuggestion] = useState('');
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const investmentStrategies = [
    { value: 'low-risk-discounted', label: 'Low Risk + Discounted' },
    { value: 'high-cashflow-rental', label: 'High Cashflow Rental' },
    { value: 'renovate-rent-sell', label: 'Renovate & Rent/Sell' },
    { value: 'buy-and-hold-growth', label: 'Buy & Hold (Long-Term Growth)' },
    { value: 'development', label: 'Development' },
    { value: 'undecided', label: 'Undecided (Guide Me)' },
  ];

  const handleStrategyChange = (e) => {
    setSelectedStrategy(e.target.value);
    setMessage(`You selected: ${e.target.value.replace(/-/g, ' ').toUpperCase()}`);
    setMessageType('success');
  };

  const getStrategySuggestion = async () => {
    if (!investmentGoal.trim()) {
      setStrategySuggestion("Please describe your investment goals to get a suggestion.");
      return;
    }
    if (!isLoggedIn) {
      setMessage("Please log in to use AI suggestions.");
      setMessageType('error');
      return;
    }

    setIsLoadingStrategy(true);
    setStrategySuggestion('');
    setMessage('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 60 seconds

    try {
      const apiUrl = `/llm-api/v1/chat/completions`; // This hits Nginx, which proxies to LLM Studio

      const payload = {
        model: "default-model",
        messages: [
          { role: "system", content: "You are a helpful real estate investment advisor. Provide concise and relevant strategy suggestions based on user goals." },
          { role: "user", content: `I am an investor. My investment goals and considerations are: "${investmentGoal}". Based on this, suggest a suitable real estate investment strategy from the following options: Low Risk + Discounted, High Cashflow Rental, Renovate & Rent/Sell, Buy & Hold (Long-Term Growth), Development. Provide a brief explanation for your suggestion. Avoid specific financial advice.` }
        ],
        temperature: 0.7,
        max_tokens: 500,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData = await response.text();
        try {
          errorData = JSON.parse(errorData);
        } catch (e) { }
        console.error(`LLM Studio API (HTTP Error ${response.status} ${response.statusText}):`, errorData);
        setMessage(`LLM Studio API Error: ${response.status} ${response.statusText}. Details: ${typeof errorData === 'object' ? (errorData.error?.message || JSON.stringify(errorData)) : errorData}`);
        setMessageType('error');
        setStrategySuggestion("Failed to get strategy suggestion. Please check console for details.");
        return;
      }

      const result = await response.json();

      if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
        const text = result.choices[0].message.content;
        setStrategySuggestion(text);
        setMessage("Investment strategy suggested!");
        setMessageType('success');
      } else {
        console.error("LLM Studio response structure unexpected:", result);
        setStrategySuggestion("Failed to get strategy suggestion from LLM Studio. Unexpected response structure.");
        setMessage("Failed to get strategy suggestion from LLM Studio. Please check LLM Studio logs and console.");
        setMessageType('error');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error calling LLM Studio API via proxy:", error);
      if (error.name === 'AbortError') {
        setMessage("AI strategy request timed out. LLM Studio might be slow or unreachable.");
        setStrategySuggestion("Request timed out. Please try again or check LLM Studio's performance.");
      } else if (error instanceof TypeError) {
        setMessage("Network error: Could not connect to LLM Studio proxy. Is Docker running and Nginx configured correctly?");
        setStrategySuggestion("Network error. Please check Docker and LLM Studio's availability.");
      } else {
        setMessage("An unexpected error occurred while fetching AI strategy.");
        setStrategySuggestion("An unexpected error occurred. Please check console for details.");
      }
      setMessageType('error');
    } finally {
      setIsLoadingStrategy(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Investor Dashboard</h2>

      {message && (
        <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">Choose Your Investment Strategy</h3>
        <p className="text-gray-700 mb-4">
          Select an investment strategy from the dropdown, or use our AI to get a tailored suggestion.
        </p>
        <select
          value={selectedStrategy}
          onChange={handleStrategyChange}
          className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          disabled={!isLoggedIn}
        >
          <option value="">Select a Strategy</option>
          {investmentStrategies.map(strategy => (
            <option key={strategy.value} value={strategy.value}>{strategy.label}</option>
          ))}
        </select>
        {selectedStrategy === 'undecided' && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-200 rounded-md text-blue-800">
            <p className="font-semibold">Guidance for Undecided Investors:</p>
            <p className="text-sm">
              Our system would ask a series of questions about your risk tolerance, capital, time horizon,
              and financial goals to suggest the most suitable investment strategy for you.
            </p>
            <button className="mt-2 text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none" disabled={!isLoggedIn}>
              Start Questionnaire (Simulated)
            </button>
          </div>
        )}
      </div>

      <div className="mb-8 p-6 bg-indigo-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-indigo-800 mb-4">AI-Powered Strategy Suggestion ✨</h3>
        <p className="text-gray-700 mb-4">
          Describe your investment goals, risk tolerance, and capital, and our AI will suggest a strategy.
        </p>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-y min-h-[100px]"
          placeholder="e.g., 'I have $200k to invest, prefer moderate risk, and am looking for long-term passive income.'"
          value={investmentGoal}
          onChange={(e) => setInvestmentGoal(e.target.value)}
          disabled={isLoadingStrategy || !isLoggedIn}
        ></textarea>
        <button
          onClick={getStrategySuggestion}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoadingStrategy || !isLoggedIn}
        >
          {isLoadingStrategy ? 'Generating...' : 'Get Strategy Suggestion ✨'}
        </button>
        {isLoadingStrategy && (
          <div className="mt-4 text-center text-indigo-700 font-medium">
            <svg className="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing goals...
          </div>
        )}
        {strategySuggestion && (
          <div className="mt-6 p-4 bg-white border border-indigo-200 rounded-md shadow-sm whitespace-pre-wrap">
            <h4 className="font-semibold text-indigo-700 mb-2">AI Suggested Strategy:</h4>
            <p className="text-gray-800">{strategySuggestion}</p>
          </div>
        )}
      </div>

      {/* Forecasting Tools & Metrics (Placeholder - for future development) */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Forecasting Tools & Metrics (To Be Developed)</h3>
        <p className="text-gray-700">
          Access simulated forecasts for capital growth, rental income, mortgage costs, and key metrics like CAGR.
          This section will be powered by data from your Laravel backend.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <MetricCard title="Projected Capital Growth" value="8.5% p.a." description="Simulated annual growth" />
          <MetricCard title="Estimated Rental Yield" value="4.2% p.a." description="Simulated annual rental income" />
          <MetricCard title="CAGR (5 Years)" value="7.1%" description="Simulated Compound Annual Growth Rate" />
          <MetricCard title="Vacancy Rate (Local)" value="1.8%" description="Simulated local vacancy rate" />
        </div>
      </div>

      {/* Educational Resources (Placeholder) */}
      <div className="p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Educational Resources</h3>
        <p className="text-gray-700">
          Explore articles and guides on various investment categories (e.g., Conventional Rental, Airbnb, Co-living, NDIS, Commercial).
        </p>
        <ul className="list-disc list-inside mt-4 text-gray-700">
          <li className="mb-1">Understanding Conventional Rental Properties</li>
          <li className="mb-1">Maximizing Returns with Airbnb Investments</li>
          <li className="mb-1">Exploring NDIS (National Disability Insurance Scheme) Investments</li>
          <li className="mb-1">Key Considerations for Commercial Property Expansion</li>
        </ul>
      </div>
    </div>
  );
};

const AgentDashboard = () => {
  const { user, isLoggedIn } = useContext(UserContext);
  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Fetch listings for the agent from Laravel backend
  useEffect(() => {
    const fetchListings = async () => {
      if (!isLoggedIn || !user || !user.id) {
        setIsLoadingListings(false);
        return;
      }
      try {
        setIsLoadingListings(true);
        // Example API endpoint: /api/user/listings (Laravel will handle user ID from auth)
        const response = await fetch(`/api/user/listings`, {
          credentials: 'include', // Important for sending cookies with Sanctum
          // If using API tokens: headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []); // Assuming listings are nested under 'listings' key
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch listings:", errorText);
          setMessage("Error loading your listings from backend.");
          setMessageType('error');
        }
      } catch (error) {
        console.error("Network error fetching listings:", error);
        setMessage("Network error loading listings. Please check backend.");
        setMessageType('error');
      } finally {
        setIsLoadingListings(false);
      }
    };
    fetchListings();
  }, [isLoggedIn, user]);

  const handleListingChange = (e) => {
    const { name, value } = e.target;
    setNewListing(prev => ({ ...prev, [name]: value }));
  };

  const addListing = async () => {
    if (!isLoggedIn || !user || !user.id) {
      setMessage("Please log in to add listings.");
      setMessageType('error');
      return;
    }
    if (!newListing.title || !newListing.price || !newListing.location) {
      setMessage("Please fill in all required fields (Title, Price, Location).");
      setMessageType('error');
      return;
    }
    try {
      // Example API endpoint: /api/user/listings
      const response = await fetch(`/api/user/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.api_token ? `Bearer ${user.api_token}` : undefined,
        },
        body: JSON.stringify({ ...newListing, agent_id: user.id }), // Laravel often expects snake_case
      });
      if (response.ok) {
        setNewListing({ title: '', description: '', price: '', location: '' }); // Clear form
        setMessage("Listing added successfully!");
        setMessageType('success');
        // Optionally, re-fetch listings to update the list immediately
        // fetchListings();
      } else {
        const errorText = await response.text();
        console.error("Error adding listing:", errorText);
        setMessage("Failed to add listing to backend.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Network error adding listing:", error);
      setMessage("Network error adding listing. Please check backend.");
      setMessageType('error');
    }
  };

  const deleteListing = async (id) => {
    if (!isLoggedIn || !user || !user.id) {
      setMessage("Please log in to delete listings.");
      setMessageType('error');
      return;
    }
    try {
      // Example API endpoint: /api/user/listings/{id}
      const response = await fetch(`/api/user/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': user.api_token ? `Bearer ${user.api_token}` : undefined },
      });
      if (response.ok) {
        setMessage("Listing deleted successfully!");
        setMessageType('success');
        // Optimistically remove from state or re-fetch
        setListings(prevListings => prevListings.filter(listing => listing.id !== id));
      } else {
        const errorText = await response.text();
        console.error("Error deleting listing:", errorText);
        setMessage("Failed to delete listing from backend.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Network error deleting listing:", error);
      setMessage("Network error deleting listing. Please check backend.");
      setMessageType('error');
    }
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Agent Dashboard</h2>

      {message && (
        <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">Add New Property Listing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Property Title" name="title" value={newListing.title} onChange={handleListingChange} disabled={!isLoggedIn} />
          <InputGroup label="Price" name="price" value={newListing.price} onChange={handleListingChange} type="number" disabled={!isLoggedIn} />
          <InputGroup label="Location" name="location" value={newListing.location} onChange={handleListingChange} disabled={!isLoggedIn} />
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={newListing.description}
              onChange={handleListingChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-y"
              placeholder="Enter property description..."
              disabled={!isLoggedIn}
            ></textarea>
          </div>
        </div>
        <button
          onClick={addListing}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isLoggedIn}
        >
          Add Listing
        </button>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Active Listings</h3>
        {!isLoggedIn ? (
            <p className="text-red-600 mb-4">Please log in to manage your listings.</p>
        ) : isLoadingListings ? (
          <p className="text-gray-600">Loading listings...</p>
        ) : listings.length === 0 ? (
          <p className="text-gray-600">You currently have no listings. Add one above!</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listings.map(listing => (
              <div key={listing.id} className="border border-gray-200 p-4 rounded-md shadow-sm bg-gray-50 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-lg text-blue-700">{listing.title}</h4>
                  <p className="text-gray-600 text-sm">Location: {listing.location} | Price: ${parseFloat(listing.price).toLocaleString()}</p>
                  <p className="text-gray-500 text-xs mt-1 overflow-hidden overflow-ellipsis whitespace-nowrap max-w-lg">{listing.description}</p>
                </div>
                <button
                  onClick={() => deleteListing(listing.id)}
                  className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                  disabled={!isLoggedIn}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buyer Intent System (Placeholder - for future development) */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Buyer Intent System (To Be Developed with Backend)</h3>
        <p className="text-gray-700">
          This section would show insights into serious buyer intent for your listings,
          identifying potential leads based on their platform activity and preferences.
          This will rely on analytics stored and processed by the Laravel backend.
        </p>
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <h4 className="font-semibold text-gray-700">Top Inquiries for Your Listings:</h4>
          <ul className="list-disc list-inside text-gray-600 text-sm mt-2">
            <li>User A (ID: {user ? user.id : 'anonymous'}) inquired about "Spacious Family Home" (high intent)</li>
            <li>User B (ID: {user ? user.id : 'anonymous'}) viewed "Modern City Apartment" 5 times (medium intent)</li>
            <li>User C (ID: {user ? user.id : 'anonymous'}) saved "Cozy Townhouse" to favorites (high intent)</li>
          </ul>
        </div>
      </div>

      {/* Agent Heatmaps (Placeholder - for future development) */}
      <div className="p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Agent Heatmaps & Insights (To Be Developed)</h3>
        <p className="text-gray-700">
          Visualize demand hot-spots, popular property types, and optimal pricing strategies based on aggregated data
          from your Laravel backend.
        </p>
        <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-lg border border-dashed border-gray-400">
          [Market Demand Heatmap Placeholder for Agents]
        </div>
      </div>
    </div>
  );
};

const VendorDashboard = () => {
  const { isLoggedIn } = useContext(UserContext);
  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Vendor Dashboard</h2>

      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">Find the Right Agent (To Be Developed with Backend)</h3>
        <p className="text-gray-700 mb-4">
          Connect with experienced real estate agents who specialize in selling properties in your area.
          Our system helps you find agents based on their track record and client reviews, managed by the Laravel backend.
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isLoggedIn}
        >
          Browse Agents (Simulated)
        </button>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Manage Reviews (To Be Developed with Backend)</h3>
        <p className="text-gray-700 mb-4">
          After a successful sale, you can leave reviews for the agents you worked with, helping other vendors.
          Reviews will be managed by the Laravel backend.
        </p>
        <button
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isLoggedIn}
        >
          Submit a Review (Simulated)
        </button>
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <h4 className="font-semibold text-gray-700">Your Past Sales & Reviews:</h4>
          <p className="text-gray-600 text-sm mt-2">
            No sales recorded yet. Once your property is sold, you can leave a review.
          </p>
        </div>
      </div>
    </div>
  );
};

const DeveloperDashboard = () => {
  const { isLoggedIn } = useContext(UserContext);

  const requestReport = () => {
    console.log("Simulated: Your exclusive report request has been submitted!");
    // This will eventually call a Laravel endpoint like /api/developer/reports
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Developer Dashboard</h2>

      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">Access Exclusive Reports (To Be Developed with Backend)</h3>
        <p className="text-gray-700 mb-4">
          Receive tailored reports based on machine learning analysis of user search data and SA2/SA3 region data.
          These reports provide deep insights into market demand, growth opportunities, and consumer preferences,
          powered by your Laravel backend.
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Market Demand Heatmaps</li>
          <li>Demographic Insights</li>
        </ul>
        <button
          onClick={requestReport}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isLoggedIn}
        >
          Request Latest Report (Simulated)
        </button>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Connect Your Website (To Be Developed with Backend)</h3>
        <p className="text-gray-700 mb-4">
          Integrate your existing development website to seamlessly feed data into our analytics engine
          and receive even more refined insights, managed by the Laravel backend.
        </p>
        <InputGroup label="Your Website URL" name="developerUrl" value="https://your-dev-site.com" onChange={() => {}} readOnly={true} disabled={!isLoggedIn} />
        <button
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isLoggedIn}
        >
          Connect Now (Simulated)
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Your current connection status: <span className="font-semibold text-green-700">Connected</span> (Simulated)
        </p>
      </div>
    </div>
  );
};

// Reusable Input Group Component
const InputGroup = ({ label, name, value, onChange, type = 'text', readOnly = false, required = false, disabled = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      required={required}
      disabled={disabled}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

// Reusable Property Card Component (Purely visual/mock for now)
const PropertyCard = ({ title, location, price }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <img
      src={`https://placehold.co/400x200/B0D0F5/2E64A8?text=${encodeURIComponent(title)}`}
      alt={title}
      className="w-full h-40 object-cover"
      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/cccccc/000000?text=Image+Not+Found'; }}
    />
    <div className="p-4">
      <h4 className="font-bold text-xl text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm mb-1"><span className="font-semibold">Location:</span> {location}</p>
      <p className="text-blue-700 font-bold text-lg">${parseFloat(price).toLocaleString()}</p>
      <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
        View Details
      </button>
    </div>
  </div>
);

// Reusable Metric Card Component for Investor Dashboard (Purely visual/mock for now)
const MetricCard = ({ title, value, description }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
    <p className="text-blue-600 text-2xl font-bold mt-1">{value}</p>
    <p className="text-gray-500 text-sm mt-1">{description}</p>
  </div>
);

// Ensure the App component is the default export for React rendering
export default App;

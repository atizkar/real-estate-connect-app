import React, { useState, useEffect, createContext, useContext } from 'react';

// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

// Context for Firebase and User state
const FirebaseContext = createContext(null);

// Declare Canvas-specific global variables as potentially undefined constants for build-time safety
const __app_id = typeof window !== 'undefined' && typeof window.__app_id !== 'undefined' ? window.__app_id : undefined;
const __firebase_config = typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined' ? window.__firebase_config : undefined;
const __initial_auth_token = typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : undefined;


// Main App Component
function App() {
  const [view, setView] = useState('home');
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    try {
      const appId = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_APP_ID)
        ? process.env.REACT_APP_APP_ID
        : (__app_id || 'default-app-id');

      let firebaseConfig = {};
      if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_CONFIG) {
        try {
          firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
        } catch (e) {
          console.error("Error parsing REACT_APP_FIREBASE_CONFIG from process.env:", e);
        }
      } else if (__firebase_config) {
        try {
          firebaseConfig = JSON.parse(__firebase_config);
        } catch (e) {
          console.error("Error parsing __firebase_config from global:", e);
        }
      }

      const initialAuthToken = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_INITIAL_AUTH_TOKEN)
        ? process.env.REACT_APP_INITIAL_AUTH_TOKEN
        : (__initial_auth_token || null);

      const debugAppId = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_APP_ID)
        ? process.env.REACT_APP_APP_ID.substring(0, 5) + "..."
        : "NOT SET or undefined in process.env";
      console.log(`DEBUG: REACT_APP_APP_ID seen by app (first 5 chars): ${debugAppId}`);

      if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is missing.");
        setIsAuthReady(true);
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          console.log("No user signed in. Attempting anonymous or custom token sign-in.");
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase Authentication failed:", error);
            setUserId(crypto.randomUUID());
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setIsAuthReady(true);
    }
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold text-gray-700">Loading application...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing Firebase and checking authentication state.</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ db, auth, userId }}>
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
            </div>
            {userId && (
              <div className="text-white text-sm mt-2 md:mt-0 p-2 bg-blue-700 rounded-md shadow-inner">
                User ID: <span className="font-mono break-all">{userId}</span>
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
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center p-4 text-sm mt-8">
          <div className="container mx-auto">
            © 2025 RealEstateConnect. All rights reserved. Providing solutions for your real estate journey.
          </div>
        </footer>
      </div>
    </FirebaseContext.Provider>
  );
}

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

const Home = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-3xl mx-auto my-8">
      <h2 className="text-4xl font-extrabold text-blue-800 mb-6">Welcome to RealEstateConnect!</h2>
      <p className="text-lg text-gray-700 leading-relaxed mb-4">
        Your ultimate platform for all real estate needs.
      </p>
      <p className="text-md text-gray-600">
        Navigate through the options above to explore tailored features for your role.
      </p>
    </div>
  );
};

const BuyerDashboard = () => {
  const { db, userId } = useContext(FirebaseContext);
  const appId = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_APP_ID)
    ? process.env.REACT_APP_APP_ID
    : (__app_id || 'default-app-id');

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

  useEffect(() => {
    if (!db || !userId) return;
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/buyerPreferences`, 'myPreferences');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPreferences(docSnap.data());
      } else {
        console.log("No buyer preferences found, starting fresh.");
      }
    }, (error) => {
      console.error("Error fetching preferences:", error);
      setMessage("Error loading preferences.");
      setMessageType('error');
    });
    return () => unsubscribe();
  }, [db, userId, appId]);

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const savePreferences = async () => {
    if (!db || !userId) {
      setMessage("Please wait, Firebase not ready.");
      setMessageType('error');
      return;
    }
    try {
      const docRef = doc(db, `artifacts/${appId}/users/${userId}/buyerPreferences`, 'myPreferences');
      await setDoc(docRef, preferences, { merge: true });
      setMessage("Preferences saved successfully!");
      setMessageType('success');
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage("Failed to save preferences.");
      setMessageType('error');
    }
  };

  const getAIRecommendation = async () => {
    if (!aiPrompt.trim()) {
      setAiResponse("Please enter a prompt for the AI recommendation.");
      return;
    }

    setIsLoadingAI(true);
    setAiResponse('');
    setMessage('');

    // --- Start of LLM Studio Fetch Logic ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    try {
      // LLM Studio endpoint - proxied through Nginx
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
        signal: controller.signal // Apply the timeout signal
      });

      clearTimeout(timeoutId); // Clear timeout if fetch completes

      if (!response.ok) {
        let errorData = await response.text(); // Get raw text first to avoid JSON parsing errors
        try {
          errorData = JSON.parse(errorData); // Try parsing as JSON
        } catch (e) {
          // If not JSON, use raw text
        }
        console.error(`LLM Studio API (HTTP Error ${response.status} ${response.statusText}):`, errorData);
        setMessage(`LLM Studio API Error: ${response.status} ${response.statusText}. Details: ${typeof errorData === 'object' ? (errorData.error?.message || JSON.stringify(errorData)) : errorData}`);
        setMessageType('error');
        setAiResponse("Failed to get AI recommendation. Please check console for details.");
        return; // Exit early on non-OK HTTP status
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
      clearTimeout(timeoutId); // Ensure timeout is cleared even on network errors
      console.error("Error calling LLM Studio API via proxy:", error);
      if (error.name === 'AbortError') {
        setMessage("AI recommendation request timed out. LLM Studio might be slow or unreachable.");
        setAiResponse("Request timed out. Please try again or check LLM Studio's performance.");
      } else if (error instanceof TypeError) { // Network errors (e.g., DNS issues, connection refused)
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
    // --- End of LLM Studio Fetch Logic ---
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Desired Location (e.g., 'Downtown', 'Suburbia')" name="location" value={preferences.location} onChange={handlePreferenceChange} />
          <InputGroup label="Property Type (e.g., 'House', 'Apartment', 'Townhouse')" name="propertyType" value={preferences.propertyType} onChange={handlePreferenceChange} />
          <InputGroup label="Budget (e.g., '$500,000 - $700,000')" name="budget" value={preferences.budget} onChange={handlePreferenceChange} />
          <InputGroup label="Lifestyle (e.g., 'Family-friendly', 'Nightlife', 'Quiet')" name="lifestyle" value={preferences.lifestyle} onChange={handlePreferenceChange} />
        </div>
        <button
          onClick={savePreferences}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
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
          disabled={isLoadingAI}
        ></textarea>
        <button
          onClick={getAIRecommendation}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoadingAI}
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

      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Suburb Heatmaps</h3>
        <p className="text-gray-700">
          This section would display interactive heatmaps.
        </p>
        <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-lg border border-dashed border-gray-400">
          [Interactive Map with Heatmap Overlay Placeholder]
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Available Properties</h3>
        <p className="text-gray-700 mb-4">
          Here you would see property listings filtered by your preferences and AI recommendations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PropertyCard title="Spacious Family Home" location="Maplewood" price="$650,000" />
          <PropertyCard title="Modern City Apartment" location="Downtown" price="$480,000" />
          <PropertyCard title="Cozy Townhouse" location="Greenview" price="$550,000" />
        </div>
      </div>
    </div>
  );
};

const InvestorDashboard = () => {
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

    setIsLoadingStrategy(true);
    setStrategySuggestion('');
    setMessage('');

    // --- Start of LLM Studio Fetch Logic ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    try {
      // LLM Studio endpoint - proxied through Nginx
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
        signal: controller.signal // Apply the timeout signal
      });

      clearTimeout(timeoutId); // Clear timeout if fetch completes

      if (!response.ok) {
        let errorData = await response.text(); // Get raw text first to avoid JSON parsing errors
        try {
          errorData = JSON.parse(errorData); // Try parsing as JSON
        } catch (e) {
          // If not JSON, use raw text
        }
        console.error(`LLM Studio API (HTTP Error ${response.status} ${response.statusText}):`, errorData);
        setMessage(`LLM Studio API Error: ${response.status} ${response.statusText}. Details: ${typeof errorData === 'object' ? (errorData.error?.message || JSON.stringify(errorData)) : errorData}`);
        setMessageType('error');
        setStrategySuggestion("Failed to get strategy suggestion. Please check console for details.");
        return; // Exit early on non-OK HTTP status
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
      clearTimeout(timeoutId); // Ensure timeout is cleared even on network errors
      console.error("Error calling LLM Studio API via proxy:", error);
      if (error.name === 'AbortError') {
        setMessage("AI strategy request timed out. LLM Studio might be slow or unreachable.");
        setStrategySuggestion("Request timed out. Please try again or check LLM Studio's performance.");
      } else if (error instanceof TypeError) { // Network errors (e.g., DNS issues, connection refused)
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
    // --- End of LLM Studio Fetch Logic ---
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
            <button className="mt-2 text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none">
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
          disabled={isLoadingStrategy}
        ></textarea>
        <button
          onClick={getStrategySuggestion}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoadingStrategy}
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

      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Forecasting Tools & Metrics</h3>
        <p className="text-gray-700">
          Access simulated forecasts for capital growth, rental income.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <MetricCard title="Projected Capital Growth" value="8.5% p.a." description="Simulated annual growth" />
          <MetricCard title="Estimated Rental Yield" value="4.2% p.a." description="Simulated annual rental income" />
          <MetricCard title="CAGR (5 Years)" value="7.1%" description="Simulated Compound Annual Growth Rate" />
          <MetricCard title="Vacancy Rate (Local)" value="1.8%" description="Simulated local vacancy rate" />
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Educational Resources</h3>
        <p className="text-gray-700">
          Explore articles and guides on various investment categories.
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
  const { db, userId } = useContext(FirebaseContext);
  const appId = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_APP_ID)
    ? process.env.REACT_APP_APP_ID
    : (__app_id || 'default-app-id');

  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (!db || !userId) return;
    const listingsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/agentListings`);
    const unsubscribe = onSnapshot(listingsCollectionRef, (snapshot) => {
      const fetchedListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(fetchedListings);
    }, (error) => {
      console.error("Error fetching agent listings:", error);
      setMessage("Error loading your listings.");
      setMessageType('error');
    });
    return () => unsubscribe();
  }, [db, userId, appId]);

  const handleListingChange = (e) => {
    const { name, value } = e.target;
    setNewListing(prev => ({ ...prev, [name]: value }));
  };

  const addListing = async () => {
    if (!db || !userId) {
      setMessage("Please wait, Firebase not ready.");
      setMessageType('error');
      return;
    }
    if (!newListing.title || !newListing.price || !newListing.location) {
      setMessage("Please fill in all required fields (Title, Price, Location).");
      setMessageType('error');
      return;
    }
    try {
      const listingsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/agentListings`);
      await addDoc(listingsCollectionRef, { ...newListing, agentId: userId, createdAt: new Date() });
      setNewListing({ title: '', description: '', price: '', location: '' });
      setMessage("Listing added successfully!");
      setMessageType('success');
    } catch (error) {
      console.error("Error adding listing:", error);
      setMessage("Failed to add listing.");
      setMessageType('error');
    }
  };

  const deleteListing = async (id) => {
    if (!db || !userId) {
      setMessage("Please wait, Firebase not ready.");
      setMessageType('error');
      return;
    }
    try {
      const listingDocRef = doc(db, `artifacts/${appId}/users/${userId}/agentListings`, id);
      await deleteDoc(listingDocRef);
      setMessage("Listing deleted successfully!");
      setMessageType('success');
    } catch (error) {
      console.error("Error deleting listing:", error);
      setMessage("Failed to delete listing.");
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
          <InputGroup label="Property Title" name="title" value={newListing.title} onChange={handleListingChange} />
          <InputGroup label="Price" name="price" value={newListing.price} onChange={handleListingChange} type="number" />
          <InputGroup label="Location" name="location" value={newListing.location} onChange={handleListingChange} />
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
            ></textarea>
          </div>
        </div>
        <button
          onClick={addListing}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Add Listing
        </button>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Active Listings</h3>
        {listings.length === 0 ? (
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
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Buyer Intent System</h3>
        <p className="text-gray-700">
          This section would show insights into serious buyer intent for your listings.
        </p>
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <h4 className="font-semibold text-gray-700">Top Inquiries for Your Listings:</h4>
          <ul className="list-disc list-inside text-gray-600 text-sm mt-2">
            <li>User A (ID: {userId ? userId.substring(0, 8) + '...' : 'anonymous'}) inquired about "Spacious Family Home" (high intent)</li>
            <li>User B (ID: {userId ? userId.substring(0, 8) + '...' : 'anonymous'}) viewed "Modern City Apartment" 5 times (medium intent)</li>
            <li>User C (ID: {userId ? userId.substring(0, 8) + '...' : 'anonymous'}) saved "Cozy Townhouse" to favorites (high intent)</li>
          </ul>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Agent Heatmaps & Insights</h3>
        <p className="text-gray-700">
          Visualize demand hot-spots, popular property types.
        </p>
        <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-lg border border-dashed border-gray-400">
          [Market Demand Heatmap Placeholder for Agents]
        </div>
      </div>
    </div>
  );
};

const VendorDashboard = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Vendor Dashboard</h2>

      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">Find the Right Agent</h3>
        <p className="text-gray-700 mb-4">
          Connect with experienced real estate agents.
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Browse Agents (Simulated)
        </button>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Manage Reviews</h3>
        <p className="text-gray-700 mb-4">
          After a successful sale, you can leave reviews.
        </p>
        <button
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
        >
          Submit a Review (Simulated)
        </button>
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          <h4 className="font-semibold text-gray-700">Your Past Sales & Reviews:</h4>
          <p className="text-gray-600 text-sm mt-2">
            No sales recorded yet.
          </p>
        </div>
      </div>
    </div>
  );
};

const DeveloperDashboard = () => {
  const { userId } = useContext(FirebaseContext);

  const requestReport = () => {
    console.log("Simulated: Your exclusive report request has been submitted!");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Developer Dashboard</h2>

      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">Access Exclusive Reports</h3>
        <p className="text-gray-700 mb-4">
          Receive tailored reports based on machine learning analysis.
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Market Demand Heatmaps</li>
          <li>Demographic Insights</li>
        </ul>
        <button
          onClick={requestReport}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Request Latest Report (Simulated)
        </button>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Connect Your Website</h3>
        <p className="text-gray-700 mb-4">
          Integrate your existing development website.
        </p>
        <InputGroup label="Your Website URL" name="developerUrl" value="https://your-dev-site.com" onChange={() => {}} readOnly={true} />
        <button
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
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

const InputGroup = ({ label, name, value, onChange, type = 'text', readOnly = false }) => (
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
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

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

const MetricCard = ({ title, value, description }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
    <p className="text-blue-600 text-2xl font-bold mt-1">{value}</p>
    <p className="text-gray-500 text-sm mt-1">{description}</p>
  </div>
);

export default App;

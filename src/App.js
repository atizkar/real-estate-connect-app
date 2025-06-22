import React, { useState, useEffect, createContext, useContext } from 'react';

// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

// Context for Firebase and User state
const FirebaseContext = createContext(null);

// Declare Canvas-specific global variables as potentially undefined constants for build-time safety
// These will be populated by the Canvas environment at runtime if they exist.
const __app_id = typeof window !== 'undefined' && typeof window.__app_id !== 'undefined' ? window.__app_id : undefined;
const __firebase_config = typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined' ? window.__firebase_config : undefined;
const __initial_auth_token = typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : undefined;


// Main App Component
function App() {
  // State to manage the current view (dashboard)
  const [view, setView] = useState('home');
  // State for Firebase instances
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  // State for user ID and authentication readiness
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Initialize Firebase and set up authentication listener
  useEffect(() => {
    try {
      // Determine appId: prioritize REACT_APP_APP_ID, then __app_id, then default
      const appId = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_APP_ID)
        ? process.env.REACT_APP_APP_ID
        : (__app_id || 'default-app-id');

      // Determine firebaseConfig: prioritize REACT_APP_FIREBASE_CONFIG (JSON string), then __firebase_config, then empty object
      let firebaseConfig = {};
      if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_CONFIG) {
        try {
          firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
        } catch (e) {
          console.error("Error parsing REACT_APP_FIREBASE_CONFIG from process.env:", e);
        }
      } else if (__firebase_config) { // Now __firebase_config is declared as a const
        try {
          firebaseConfig = JSON.parse(__firebase_config);
        } catch (e) {
          console.error("Error parsing __firebase_config from global:", e);
        }
      }

      // Determine initialAuthToken: prioritize REACT_APP_INITIAL_AUTH_TOKEN, then __initial_auth_token, then null
      const initialAuthToken = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_INITIAL_AUTH_TOKEN)
        ? process.env.REACT_APP_INITIAL_AUTH_TOKEN
        : (__initial_auth_token || null); // Now __initial_auth_token is declared as a const


      if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is missing. Please ensure it's defined via environment variables (REACT_APP_FIREBASE_CONFIG) or Canvas globals (__firebase_config).");
        setIsAuthReady(true); // Mark auth as ready even if config is missing to avoid blocking UI
        return;
      }

      // Initialize Firebase App
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          // User is signed in
          setUserId(user.uid);
        } else {
          // User is signed out or not yet authenticated
          console.log("No user signed in. Attempting anonymous or custom token sign-in.");
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
            // After sign-in, onAuthStateChanged will trigger again with the user object
          } catch (error) {
            console.error("Firebase Authentication failed:", error);
            // Fallback to a random UUID if anonymous sign-in also fails, for basic functionality
            setUserId(crypto.randomUUID());
          }
        }
        setIsAuthReady(true); // Authentication state has been checked
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setIsAuthReady(true); // Mark auth as ready even if initialization failed
    }
  }, []); // Empty dependency array means this effect runs once on mount

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
    // Provide Firebase instances and user ID through context
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
          {/* Conditional rendering based on the selected view */}
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
            © 2025 RealEstateConnect. All rights reserved. ارائه راهکارهایی برای سفر املاک و مستغلات شما.
          </div>
        </footer>
      </div>
    </FirebaseContext.Provider>
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

// Buyer Dashboard Component
const BuyerDashboard = () => {
  const { db, userId } = useContext(FirebaseContext);
  // Get appId from process.env or global __app_id for Firestore paths
  const appId = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_APP_ID)
    ? process.env.REACT_APP_APP_ID
    : (__app_id || 'default-app-id'); // Use the __app_id const declared at the top

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

  // Load preferences from Firestore on component mount
  useEffect(() => {
    if (!db || !userId) return;

    // Use the resolved appId for Firestore path
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

    return () => unsubscribe(); // Cleanup snapshot listener
  }, [db, userId, appId]); // Add appId to dependency array

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
      // Use the resolved appId for Firestore path
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

    try {
      let chatHistory = [];
      const userPrompt = `Based on these preferences: Location: ${preferences.location || 'N/A'}, Property Type: ${preferences.propertyType || 'N/A'}, Budget: ${preferences.budget || 'N/A'}, Lifestyle: ${preferences.lifestyle || 'N/A'}. User's specific request: "${aiPrompt}". Suggest suitable suburbs and reasons. Focus on general advice and avoid specific financial recommendations.`;

      chatHistory.push({ role: "user", parts: [{ text: userPrompt }] });
      const payload = { contents: chatHistory };
      // Use process.env.REACT_APP_GEMINI_API_KEY for API key
      const apiKey = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY)
        ? process.env.REACT_APP_GEMINI_API_KEY
        : "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setAiResponse(text);
        setMessage("AI recommendation generated!");
        setMessageType('success');
      } else {
        console.error("AI response structure unexpected:", result);
        setAiResponse("Failed to get AI recommendation. Please try again.");
        setMessage("Failed to get AI recommendation. Please try again.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setAiResponse("An error occurred while fetching AI recommendation. Please check your network connection.");
      setMessage("An error occurred while fetching AI recommendation.");
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

      {/* Preference Input */}
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

      {/* AI-Powered Recommendations */}
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

      {/* Suburb Heatmaps (Placeholder) */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Suburb Heatmaps</h3>
        <p className="text-gray-700">
          This section would display interactive heatmaps showing preferences, amenities, and growth potential
          for different suburbs based on your criteria.
        </p>
        <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-lg border border-dashed border-gray-400">
          [Interactive Map with Heatmap Overlay Placeholder]
        </div>
      </div>

      {/* Property Listings (Placeholder) */}
      <div className="p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Available Properties</h3>
        <p className="text-gray-700 mb-4">
          Here you would see property listings filtered by your preferences and AI recommendations.
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

// Investor Dashboard Component
const InvestorDashboard = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState(''); // New state for investment goal
  const [strategySuggestion, setStrategySuggestion] = useState(''); // New state for LLM strategy
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false); // New loading state for strategy LLM
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

    try {
      let chatHistory = [];
      const userPrompt = `I am an investor. My investment goals and considerations are: "${investmentGoal}". Based on this, suggest a suitable real estate investment strategy from the following options: Low Risk + Discounted, High Cashflow Rental, Renovate & Rent/Sell, Buy & Hold (Long-Term Growth), Development. Provide a brief explanation for your suggestion. Avoid specific financial advice.`;

      chatHistory.push({ role: "user", parts: [{ text: userPrompt }] });
      const payload = { contents: chatHistory };
      const apiKey = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY)
        ? process.env.REACT_APP_GEMINI_API_KEY
        : "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setStrategySuggestion(text);
        setMessage("Investment strategy suggested!");
        setMessageType('success');
      } else {
        console.error("AI response structure unexpected:", result);
        setStrategySuggestion("Failed to get strategy suggestion. Please try again.");
        setMessage("Failed to get strategy suggestion. Please try again.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("Error calling Gemini API for strategy:", error);
      setStrategySuggestion("An error occurred while fetching strategy suggestion.");
      setMessage("An error occurred while fetching strategy suggestion.");
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

      {/* Investment Strategy Selection */}
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

      {/* AI-Powered Strategy Suggestion */}
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

      {/* Forecasting Tools & Metrics (Placeholder) */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Forecasting Tools & Metrics</h3>
        <p className="text-gray-700">
          Access simulated forecasts for capital growth, rental income, mortgage costs, and key metrics like CAGR.
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

// Agent Dashboard Component
const AgentDashboard = () => {
  const { db, userId } = useContext(FirebaseContext);
  // Get appId from process.env or global __app_id for Firestore paths
  const appId = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_APP_ID)
    ? process.env.REACT_APP_APP_ID
    : (__app_id || 'default-app-id'); // Use the __app_id const declared at the top

  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Fetch listings for the agent
  useEffect(() => {
    if (!db || !userId) return;

    // Agent-specific listings (private data)
    // Use the resolved appId for Firestore path
    const listingsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/agentListings`);
    const unsubscribe = onSnapshot(listingsCollectionRef, (snapshot) => {
      const fetchedListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(fetchedListings);
    }, (error) => {
      console.error("Error fetching agent listings:", error);
      setMessage("Error loading your listings.");
      setMessageType('error');
    });

    return () => unsubscribe(); // Cleanup snapshot listener
  }, [db, userId, appId]); // Add appId to dependency array

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
      // Use the resolved appId for Firestore path
      const listingsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/agentListings`);
      await addDoc(listingsCollectionRef, { ...newListing, agentId: userId, createdAt: new Date() });
      setNewListing({ title: '', description: '', price: '', location: '' }); // Clear form
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
      // Use the resolved appId for Firestore path
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

      {/* Add New Listing */}
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

      {/* Your Listings */}
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

      {/* Buyer Intent System (Placeholder) */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Buyer Intent System</h3>
        <p className="text-gray-700">
          This section would show insights into serious buyer intent for your listings,
          identifying potential leads based on their platform activity and preferences.
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

      {/* Agent Heatmaps (Placeholder) */}
      <div className="p-6 bg-white rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Agent Heatmaps & Insights</h3>
        <p className="text-gray-700">
          Visualize demand hot-spots, popular property types, and optimal pricing strategies based on aggregated data.
        </p>
        <div className="mt-4 h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-lg border border-dashed border-gray-400">
          [Market Demand Heatmap Placeholder for Agents]
        </div>
      </div>
    </div>
  );
};

// Vendor Dashboard Component
const VendorDashboard = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Vendor Dashboard</h2>

      {/* Find an Agent */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">Find the Right Agent</h3>
        <p className="text-gray-700 mb-4">
          Connect with experienced real estate agents who specialize in selling properties in your area.
          Our system helps you find agents based on their track record and client reviews.
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Browse Agents (Simulated)
        </button>
      </div>

      {/* Get Reviews */}
      <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Manage Reviews</h3>
        <p className="text-gray-700 mb-4">
          After a successful sale, you can leave reviews for the agents you worked with, helping other vendors.
        </p>
        <button
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
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

// Developer Dashboard Component
const DeveloperDashboard = () => {
  const { userId } = useContext(FirebaseContext);

  const requestReport = () => {
    // In a real application, this would trigger a backend process
    // to generate and deliver the report.
    // Replaced alert() with a console.log for compatibility in Canvas
    console.log("Simulated: Your exclusive report request has been submitted!");
    // You might consider a custom modal or toast notification here instead of alert.
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b pb-3">Developer Dashboard</h2>

      {/* Access Exclusive Reports */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4">Access Exclusive Reports</h3>
        <p className="text-gray-700 mb-4">
          Receive tailored reports based on machine learning analysis of user search data and SA2/SA3 region data.
          These reports provide deep insights into market demand, growth opportunities, and consumer preferences.
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Market Demand Heatmaps (by suburb, property type)</li>
          <li>Demographic Insights for specific regions</li>
          <li>Historical Search Trends & Forecasts</li>
          <li>Competitor Analysis (simulated)</li>
        </ul>
        <button
          onClick={requestReport}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Request Latest Report (Simulated)
        </button>
      </div>

      {/* Connect Website URL */}
      <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Connect Your Website</h3>
        <p className="text-gray-700 mb-4">
          Integrate your existing development website to seamlessly feed data into our analytics engine
          and receive even more refined insights.
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

// Reusable Input Group Component
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

// Reusable Property Card Component
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

// Reusable Metric Card Component for Investor Dashboard
const MetricCard = ({ title, value, description }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
    <p className="text-blue-600 text-2xl font-bold mt-1">{value}</p>
    <p className="text-gray-500 text-sm mt-1">{description}</p>
  </div>
);

// Ensure the App component is the default export for React rendering
export default App;
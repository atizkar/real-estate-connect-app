import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a context for authentication state and user data
const AuthContext = createContext(null);

// Custom hook to use the authentication context
const useAuth = () => useContext(AuthContext);

// Base URL for your Laravel API
const API_BASE_URL = 'http://localhost:3002/api';
const BASE_URL = 'http://localhost:3002';

// --- Placeholder Components for New Features ---

const SuburbHeatmapsPage = () => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Suburb Heatmaps</h2>
    <p className="text-gray-600">This page will display interactive heatmaps showing property value trends, rental yields, and demographic data across different suburbs.</p>
    <p className="text-gray-500 mt-2">Feature: To Be Developed.</p>
  </div>
);

const AvailablePropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to view properties.");
      return;
    }

    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/properties`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProperties(data.properties);
      } catch (err) {
        setError("Failed to fetch properties: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [user]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading properties...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Available Properties</h2>
      <p className="text-gray-600 mb-4">Explore a wide range of properties available for sale or rent, filtered by your preferences.</p>
      <p className="text-gray-500 mt-2 mb-4">Feature: To Be Developed with Backend.</p>
      {properties.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(prop => (
            <li key={prop.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800">{prop.title}</h3>
              <p className="text-gray-600">Location: {prop.location}</p>
              <p className="text-gray-600">Price: ${prop.price}</p>
              <p className="text-gray-500 text-sm mt-2">{prop.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No properties available at the moment.</p>
      )}
    </div>
  );
};

const ForecastingToolsPage = () => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Forecasting Tools & Metrics</h2>
    <p className="text-gray-600">Utilize advanced algorithms to predict market trends, property appreciation, and investment returns.</p>
    <p className="text-gray-500 mt-2">Feature: To Be Developed.</p>
  </div>
);

const BuyerIntentSystemPage = () => {
  const [intentData, setIntentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to access buyer intent data.");
      return;
    }

    const fetchIntent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/buyer-intent`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIntentData(data.intent);
      } catch (err) {
        setError("Failed to fetch buyer intent: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIntent();
  }, [user]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading buyer intent data...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Buyer Intent System</h2>
      <p className="text-gray-600 mb-4">Gain insights into potential buyer behavior and preferences to optimize your sales strategy.</p>
      <p className="text-gray-500 mt-2 mb-4">Feature: To Be Developed with Backend.</p>
      {intentData ? (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">Intent Summary:</h3>
          <p className="text-gray-600">Location Interest: {intentData.locationInterest}</p>
          <p className="text-gray-600">Property Type Demand: {intentData.propertyTypeDemand}</p>
          <p className="text-gray-600">Budget Range: {intentData.budgetRange}</p>
        </div>
      ) : (
        <p className="text-gray-500">No buyer intent data available.</p>
      )}
    </div>
  );
};

const AgentHeatmapsPage = () => (
  <div className="p-6 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agent Heatmaps & Insights</h2>
    <p className="text-gray-600">Visualize agent performance, active areas, and market share through interactive heatmaps and detailed reports.</p>
    <p className="text-gray-500 mt-2">Feature: To Be Developed.</p>
  </div>
);

const FindAgentPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to find agents.");
      return;
    }

    const fetchAgents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/find-agent`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAgents(data.agents);
      } catch (err) {
        setError("Failed to fetch agents: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [user]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading agents...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Find the Right Agent</h2>
      <p className="text-gray-600 mb-4">Discover top-performing real estate agents in your area based on their expertise, reviews, and success rates.</p>
      <p className="text-gray-500 mt-2 mb-4">Feature: To Be Developed with Backend.</p>
      {agents.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <li key={agent.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800">{agent.name}</h3>
              <p className="text-gray-600">Specialty: {agent.specialty}</p>
              <p className="text-gray-600">Rating: {agent.rating} / 5</p>
              <p className="text-gray-500 text-sm mt-2">{agent.bio}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No agents found.</p>
      )}
    </div>
  );
};

const ManageReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to manage reviews.");
      return;
    }

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/manage-reviews`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReviews(data.reviews);
      } catch (err) {
        setError("Failed to fetch reviews: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading reviews...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Manage Reviews</h2>
      <p className="text-gray-600 mb-4">View and respond to reviews from your clients, maintaining your professional reputation.</p>
      <p className="text-gray-500 mt-2 mb-4">Feature: To Be Developed with Backend.</p>
      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map(review => (
            <li key={review.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="font-medium text-gray-800">"{review.comment}"</p>
              <p className="text-gray-600 text-sm mt-1">- {review.reviewer} (Rating: {review.rating}/5)</p>
              <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors">Respond</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No reviews to manage.</p>
      )}
    </div>
  );
};

const ExclusiveReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to access exclusive reports.");
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/exclusive-reports`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReports(data.reports);
      } catch (err) {
        setError("Failed to fetch reports: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading reports...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Access Exclusive Reports</h2>
      <p className="text-gray-600 mb-4">Gain a competitive edge with in-depth market analyses, demographic studies, and investment forecasts.</p>
      <p className="text-gray-500 mt-2 mb-4">Feature: To Be Developed with Backend.</p>
      {reports.length > 0 ? (
        <ul className="space-y-4">
          {reports.map(report => (
            <li key={report.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-800">{report.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{report.description}</p>
              <a href={report.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-2 block">Download Report</a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No exclusive reports available.</p>
      )}
    </div>
  );
};

const ConnectWebsitePage = () => {
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to manage your website connection.");
      return;
    }

    const fetchWebsiteData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/connect-website`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWebsiteData(data.website);
      } catch (err) {
        setError("Failed to fetch website connection data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWebsiteData();
  }, [user]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading website connection data...</div>;
  if (error) return <div className="p-6 text-red-600 text-center">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Connect Your Website</h2>
      <p className="text-gray-600 mb-4">Integrate your existing real estate website with our platform to synchronize listings, leads, and client data.</p>
      <p className="text-gray-500 mt-2 mb-4">Feature: To Be Developed with Backend.</p>
      {websiteData ? (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">Website Status:</h3>
          <p className="text-gray-600">URL: {websiteData.url}</p>
          <p className="text-gray-600">Status: {websiteData.status}</p>
          <p className="text-gray-600">Last Sync: {websiteData.lastSync}</p>
          <button className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors">Sync Now</button>
        </div>
      ) : (
        <p className="text-gray-500">No website connected yet.</p>
      )}
    </div>
  );
};


// --- Dashboard Components ---

const BuyerDashboard = ({ navigate }) => {
  const { user, logout } = useAuth();
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 text-white p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Buyer Dashboard</h1>
        <nav className="space-y-2">
          <button onClick={() => navigate('buyerHome')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Home</button>
          <button onClick={() => navigate('buyerPreferences')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">My Preferences</button>
          <button onClick={() => navigate('availableProperties')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Available Properties</button>
          <button onClick={() => navigate('suburbHeatmaps')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Suburb Heatmaps</button>
          <button onClick={() => navigate('forecastingTools')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Forecasting Tools</button>
          <button onClick={() => navigate('buyerIntent')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Buyer Intent System</button>
          <button onClick={logout} className="w-full text-left py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 transition-colors mt-4">Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Welcome, {user.name}!</h2>
        <p className="text-gray-700 mb-8">This is your personalized buyer dashboard. Use the navigation to explore features.</p>
        {/* Content specific to buyer dashboard home */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Property Matches</h3>
            <p className="text-gray-600">Based on your preferences, we found 15 new properties.</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">View Matches</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Market Insights</h3>
            <p className="text-gray-600">Latest trends indicate a 2% price increase in your preferred areas.</p>
            <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">Read Report</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Saved Searches</h3>
            <p className="text-gray-600">You have 3 active saved searches. New properties added daily.</p>
            <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors">Manage Searches</button>
          </div>
        </div>
      </main>
    </div>
  );
};

const AgentDashboard = ({ navigate }) => {
  const { user, logout } = useAuth();
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 text-white p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>
        <nav className="space-y-2">
          <button onClick={() => navigate('agentHome')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Home</button>
          <button onClick={() => navigate('agentListings')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">My Listings</button>
          <button onClick={() => navigate('agentHeatmaps')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Agent Heatmaps</button>
          <button onClick={() => navigate('manageReviews')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Manage Reviews</button>
          <button onClick={() => navigate('exclusiveReports')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Exclusive Reports</button>
          <button onClick={() => navigate('connectWebsite')} className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Connect Website</button>
          <button onClick={logout} className="w-full text-left py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 transition-colors mt-4">Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Welcome, Agent {user.name}!</h2>
        <p className="text-gray-700 mb-8">This is your personalized agent dashboard. Manage your listings and client interactions.</p>
        {/* Content specific to agent dashboard home */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Active Listings</h3>
            <p className="text-gray-600">You currently have 7 active properties listed.</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">View Listings</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">New Leads</h3>
            <p className="text-gray-600">3 new potential buyers contacted you today.</p>
            <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">Manage Leads</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Performance Metrics</h3>
            <p className="text-gray-600">Your conversion rate increased by 5% last quarter.</p>
            <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors">View Report</button>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Other Dashboard Placeholders (Simplified) ---
const InvestorDashboard = ({ logout }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
      <aside className="w-full md:w-64 bg-gray-800 text-white p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Investor Dashboard</h1>
        <nav className="space-y-2">
          <button className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Investment Opportunities</button>
          <button className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Portfolio Performance</button>
          <button onClick={logout} className="w-full text-left py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 transition-colors mt-4">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Welcome, Investor {user.name}!</h2>
        <p className="text-gray-700 mb-8">This is your investor dashboard. Explore potential investments.</p>
      </main>
    </div>
  );
};

const VendorDashboard = ({ logout }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
      <aside className="w-full md:w-64 bg-gray-800 text-white p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>
        <nav className="space-y-2">
          <button className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">My Properties</button>
          <button className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Offers Received</button>
          <button onClick={logout} className="w-full text-left py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 transition-colors mt-4">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Welcome, Vendor {user.name}!</h2>
        <p className="text-gray-700 mb-8">This is your vendor dashboard. Manage your property sales.</p>
      </main>
    </div>
  );
};

const DeveloperDashboard = ({ logout }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
      <aside className="w-full md:w-64 bg-gray-800 text-white p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Developer Dashboard</h1>
        <nav className="space-y-2">
          <button className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Project Pipeline</button>
          <button className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Land Acquisition</button>
          <button onClick={logout} className="w-full text-left py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 transition-colors mt-4">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Welcome, Developer {user.name}!</h2>
        <p className="text-gray-700 mb-8">This is your developer dashboard. Oversee your projects.</p>
      </main>
    </div>
  );
};


// --- Auth Pages ---

const LoginPage = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigate('register')} className="text-blue-600 hover:underline">Register</button>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = ({ navigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Use login to automatically log in after register

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // First, get the CSRF cookie
      await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // Important for Laravel to recognize AJAX
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          // Handle validation errors
          const errorMessages = Object.values(data.errors).flat().join(' ');
          setError(errorMessages);
        } else {
          setError(data.message || 'Registration failed.');
        }
        return;
      }

      // If registration is successful, automatically log in the user
      await login(email, password);

    } catch (err) {
      setError(err.message || 'Network error or server unreachable.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <button onClick={() => navigate('login')} className="text-blue-600 hover:underline">Login</button>
        </p>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login'); // Default to login page

  // Function to fetch user data after login/registration
  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Navigate to appropriate dashboard based on user role (mocked for now)
        if (data.user) {
          // Mocking roles based on a simple check, replace with actual role logic
          if (data.user.email.includes('agent')) {
            setCurrentPage('agentDashboard');
          } else if (data.user.email.includes('investor')) {
            setCurrentPage('investorDashboard');
          } else if (data.user.email.includes('vendor')) {
            setCurrentPage('vendorDashboard');
            // } else if (data.user.email.includes('developer')) { // Example for developer
            //   setCurrentPage('developerDashboard');
          } else {
            setCurrentPage('buyerDashboard'); // Default to buyer
          }
        }
      } else if (response.status === 401) {
        setUser(null); // Not authenticated
        setCurrentPage('login');
      } else {
        console.error('Failed to fetch user data:', response.statusText);
        setUser(null);
        setCurrentPage('login');
      }
    } catch (error) {
      console.error('Network error fetching user:', error);
      setUser(null);
      setCurrentPage('login');
    }
  };

  // Function to handle user login
  const login = async (email, password) => {
    // First, get the CSRF cookie
    await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    // After successful login, fetch user data to set state and navigate
    await fetchUser();
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      setUser(null);
      setCurrentPage('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check authentication status on app load
  useEffect(() => {
    fetchUser();
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
  };

  const authContextValue = { user, login, logout, fetchUser };

  // Render different pages based on authentication status and current page
  return (
    <AuthContext.Provider value={authContextValue}>
      {user ? (
        // User is authenticated, render dashboard or specific feature page
        <div className="min-h-screen bg-gray-100 font-inter">
          {(() => {
            switch (currentPage) {
              case 'buyerDashboard':
              case 'buyerHome':
                return <BuyerDashboard navigate={navigate} />;
              case 'buyerPreferences':
                // Placeholder for buyer preferences page (if needed, otherwise handled by dashboard)
                return <div className="p-8"><h2 className="text-3xl font-semibold mb-6">My Preferences (Buyer)</h2><p>Content for buyer preferences.</p></div>;
              case 'agentDashboard':
              case 'agentHome':
                return <AgentDashboard navigate={navigate} />;
              case 'agentListings':
                // Placeholder for agent listings page (if needed, otherwise handled by dashboard)
                return <div className="p-8"><h2 className="text-3xl font-semibold mb-6">My Listings (Agent)</h2><p>Content for agent listings.</p></div>;
              case 'investorDashboard':
                return <InvestorDashboard logout={logout} />;
              case 'vendorDashboard':
                return <VendorDashboard logout={logout} />;
              case 'developerDashboard':
                return <DeveloperDashboard logout={logout} />;

              // --- New Feature Pages ---
              case 'suburbHeatmaps':
                return <SuburbHeatmapsPage />;
              case 'availableProperties':
                return <AvailablePropertiesPage />;
              case 'forecastingTools':
                return <ForecastingToolsPage />;
              case 'buyerIntent':
                return <BuyerIntentSystemPage />;
              case 'agentHeatmaps':
                return <AgentHeatmapsPage />;
              case 'findAgent':
                return <FindAgentPage />;
              case 'manageReviews':
                return <ManageReviewsPage />;
              case 'exclusiveReports':
                return <ExclusiveReportsPage />;
              case 'connectWebsite':
                return <ConnectWebsitePage />;

              default:
                return <BuyerDashboard navigate={navigate} />; // Fallback to buyer dashboard
            }
          })()}
        </div>
      ) : (
        // User is not authenticated, render login or register page
        (() => {
          switch (currentPage) {
            case 'register':
              return <RegisterPage navigate={navigate} />;
            case 'login':
            default:
              return <LoginPage navigate={navigate} />;
          }
        })()
      )}
    </AuthContext.Provider>
  );
}

export default App;

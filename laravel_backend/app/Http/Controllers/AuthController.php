<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user); // Log in the user after registration

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user->only('id', 'name', 'email')
        ], 201);
    }

    /**
     * Authenticate a user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        // Attempt to authenticate the user
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials.'
            ], 401);
        }

        $user = Auth::user();

        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => $user->only('id', 'name', 'email')
        ]);
    }

    /**
     * Log out the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Get the authenticated user details.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        if (Auth::check()) {
            return response()->json(['user' => $request->user()->only('id', 'name', 'email')]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    // --- Buyer Dashboard Methods (Existing) ---
    /**
     * Placeholder for user preferences (for Buyer Dashboard).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserPreferences(Request $request)
    {
        if (Auth::check()) {
            // Return mock preferences for demonstration
            return response()->json([
                'preferences' => [
                    'location' => 'Mock Location',
                    'propertyType' => 'Mock Type',
                    'budget' => 'Mock Budget',
                    'lifestyle' => 'Mock Lifestyle',
                ]
            ]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Placeholder for saving user preferences.
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveUserPreferences(Request $request)
    {
        if (Auth::check()) {
            // In a real app, you would save $request->all() to the database for Auth::user()
            return response()->json(['message' => 'Preferences saved (mock)!', 'preferences' => $request->all()]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    // --- Agent Dashboard Methods (Existing) ---
    /**
     * Placeholder for agent listings (for Agent Dashboard).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAgentListings(Request $request)
    {
        if (Auth::check()) {
            // Return mock listings for demonstration
            return response()->json([
                'listings' => [
                    ['id' => 1, 'title' => 'Mock Listing 1', 'location' => 'Suburb A', 'price' => '500000', 'description' => 'A beautiful mock home.'],
                    ['id' => 2, 'title' => 'Mock Listing 2', 'location' => 'Suburb B', 'price' => '750000', 'description' => 'A spacious mock apartment.'],
                ]
            ]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Placeholder for adding a new agent listing.
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addAgentListing(Request $request)
    {
        if (Auth::check()) {
            // In a real app, you would save $request->all() to the database, associating with Auth::user()
            $newListing = array_merge($request->all(), ['id' => rand(100, 999), 'agent_id' => Auth::id()]);
            return response()->json(['message' => 'Listing added (mock)!', 'listing' => $newListing], 201);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Placeholder for deleting an agent listing.
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAgentListing(Request $request, $id)
    {
        if (Auth::check()) {
            // In a real app, you would delete the listing with the given $id, ensuring it belongs to Auth::user()
            return response()->json(['message' => "Listing {$id} deleted (mock)!"]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    // --- NEW FEATURE METHODS ---

    /**
     * Get available properties (mock data).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableProperties(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'properties' => [
                    ['id' => 101, 'title' => 'Downtown Condo', 'location' => 'City Center', 'price' => '450000', 'description' => 'Modern 2-bed condo with city views.'],
                    ['id' => 102, 'title' => 'Suburban Family House', 'location' => 'Green Acres', 'price' => '720000', 'description' => 'Spacious 4-bed house with a large backyard.'],
                    ['id' => 103, 'title' => 'Beachfront Villa', 'location' => 'Ocean View', 'price' => '1200000', 'description' => 'Luxury villa steps from the beach.'],
                ]
            ]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Get buyer intent data (mock data).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBuyerIntent(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'intent' => [
                    'locationInterest' => 'High demand in Suburb X, growing interest in Suburb Y.',
                    'propertyTypeDemand' => 'Strong demand for 3-bedroom houses, moderate for apartments.',
                    'budgetRange' => 'Most inquiries in $500k-$700k range.',
                ]
            ]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Find agents (mock data).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function findAgent(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'agents' => [
                    ['id' => 201, 'name' => 'Alice Smith', 'specialty' => 'Residential, Luxury', 'rating' => 4.9, 'bio' => 'Top agent in luxury homes.'],
                    ['id' => 202, 'name' => 'Bob Johnson', 'specialty' => 'Commercial, Investments', 'rating' => 4.7, 'bio' => 'Expert in commercial property deals.'],
                ]
            ]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Manage reviews (mock data).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function manageReviews(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'reviews' => [
                    ['id' => 301, 'reviewer' => 'Client A', 'rating' => 5, 'comment' => 'Excellent service, highly recommend!'],
                    ['id' => 302, 'reviewer' => 'Client B', 'rating' => 4, 'comment' => 'Very professional and responsive.'],
                ]
            ]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Access exclusive reports (mock data).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getExclusiveReports(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'reports' => [
                    ['id' => 401, 'title' => 'Q2 Market Analysis', 'description' => 'In-depth analysis of Q2 real estate trends.', 'link' => '#'],
                    ['id' => 402, 'title' => 'Investment Hotspots 2025', 'description' => 'Identifies top areas for investment in the coming year.', 'link' => '#'],
                ]
            ]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Connect website (mock data).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function connectWebsite(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'website' => [
                    'url' => 'https://mock-connected-site.com',
                    'status' => 'Connected',
                    'lastSync' => '2025-06-29 10:30 AM',
                ]
            ]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }
}

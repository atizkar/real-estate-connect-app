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

    /**
     * Placeholder for user preferences (for Buyer Dashboard).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserPreferences(Request $request)
    {
        if (Auth::check()) {
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
            return response()->json(['message' => 'Preferences saved (mock)!', 'preferences' => $request->all()]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }

    /**
     * Placeholder for agent listings (for Agent Dashboard).
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAgentListings(Request $request)
    {
        if (Auth::check()) {
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
            $newListing = array_merge($request->all(), ['id' => rand(100, 999)]);
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
            return response()->json(['message' => "Listing {$id} deleted (mock)!"]);
        }
        return response()->json(['message' => 'Unauthorized.'], 401);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

        $notifications = DB::table('notifications')
    ->where('user_id', $user->id)
    ->orderBy('created_at', 'desc')
    ->limit(20)
    ->get()
    //convert dates to ISO format
    ->map(function ($n) {
        $n->created_at = \Carbon\Carbon::parse($n->created_at)->toIso8601String();
        $n->read_at = $n->read_at
            ? \Carbon\Carbon::parse($n->read_at)->toIso8601String()
            : null;
        return $n;
    });

//count unread notifications
            $unreadCount = DB::table('notifications')
                ->where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'status' => true,
                'data' => $notifications,
                'unread_count' => $unreadCount,
                'count' => $notifications->count()
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching notifications: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching notifications'
            ], 500);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        try {
            $user = $request->user();

            DB::table('notifications')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                    'updated_at' => now()
                ]);

            return response()->json([
                'status' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            Log::error("Error marking notification as read: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error updating notification'
            ], 500);
        }
    }

    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->user();

            DB::table('notifications')
                ->where('user_id', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                    'updated_at' => now()
                ]);

            return response()->json([
                'status' => true,
                'message' => 'All notifications marked as read'
            ]);

        } catch (\Exception $e) {
            Log::error("Error marking all notifications as read: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error updating notifications'
            ], 500);
        }
    }
}

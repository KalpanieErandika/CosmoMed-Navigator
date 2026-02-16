<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Complaint;
use Illuminate\Support\Facades\Storage;

class ComplaintController extends Controller
{
    public function store(Request $request)
{
    $request->validate([
        'category' => 'required|string',
        'description' => 'required|string',
        'file' => 'nullable|mimes:jpeg,png,jpg,pdf|max:2048',
    ]);
    $filePath = null;

    // Handle file upload
    if ($request->hasFile('file') && $request->file('file')->isValid()) {
        try {
            $filePath = $request->file('file')->store('complaints', 'public'); //Stores file in storage/app/public/complaints
        } catch (\Exception $e) {
            \Log::error('File storage failed:', ['error' => $e->getMessage()]);
        }
    } else {
        \Log::warning('File upload failed or no file provided');
    }

    $complaint = Complaint::create([
        'user_id' => auth()->id() ,
       'email' => auth()->user()->email,
        'category' => $request->category,
        'description' => $request->description,
        'image_url' => $filePath,
        'attachment_count' => $filePath ? 1 : 0,
        'status' => 'Pending',
        'submitted_at' => now(),
    ]);

    return response()->json([
        'message' => 'Complaint submitted successfully',
        'complaint' => $complaint
    ], 201);
}
    public function index()
    {
        //get all complaints with file url
        $complaints = Complaint::orderBy('submitted_at', 'desc')->get();
        return response()->json($complaints);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,In Review,Resolved,Rejected',
        ]);

        $complaint = Complaint::find($id);
        if (!$complaint) {
            return response()->json(['message' => 'Complaint not found'], 404);
        }
        $complaint->status = $request->status;
        $complaint->save();

        return response()->json(['message' => 'Status updated successfully', 'complaint' => $complaint]);
    }

}

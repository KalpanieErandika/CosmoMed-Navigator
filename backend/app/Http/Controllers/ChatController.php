<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $userMessage = $request->input('message');
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'response' => 'Gemini API key is missing.'
            ], 500);
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey"; //endpoint api
        $payload = [
            "contents" => [
                [
                    "role" => "user",
                    "parts" => [
                        ["text" => $userMessage]
                    ]
                ]
            ],
            "generationConfig" => [
                "temperature" => 0.7,
                "maxOutputTokens" => 2048
            ]
        ];

        try {
            $response = Http::withHeaders([ //HTTP client to post json to gemini
                'Content-Type' => 'application/json'
            ])->post($url, $payload);

            if (!$response->successful()) {
                return response()->json([
                    'response' => 'Gemini API returned an error.',
                    'status' => $response->status(),
                    'body' => $response->body()
                ], $response->status());
            }
            $data = $response->json();

            //extract the bot's response from the correct location
            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                $botReply = $data['candidates'][0]['content']['parts'][0]['text'];
            } else {
                $botReply = 'Sorry, I could not process your request.';
            }
            return response()->json(['response' => $botReply]);

        } catch (\Exception $e) {
            return response()->json([
                'response' => 'Exception occurred while contacting Gemini API.',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

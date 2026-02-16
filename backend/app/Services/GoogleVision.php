<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GoogleVisionService
{
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = env('GOOGLE_VISION_API_KEY');
    }

    public function extractText($imagePath)
    {
        $url = "https://vision.googleapis.com/v1/images:annotate?key={$this->apiKey}";

        $imageData = base64_encode(file_get_contents($imagePath));

        $response = Http::post($url, [
            'requests' => [
                [
                    'image' => ['content' => $imageData],
                    'features' => [['type' => 'TEXT_DETECTION']],
                ]
            ]
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        return null;
    }
}

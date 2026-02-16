<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()->user_type === 'pharmacist'
            && $this->user()->pharmacist_status === 'approved';
    }

    public function rules()
    {
        return [
            'contact_no' => 'required|string|max:10|regex:/^[0-9+\-\s()]+$/'
        ];
    }

    public function messages()
    {
        return [
            'contact_no.required' => 'Contact number is required',
            'contact_no.regex' => 'Invalid contact number format',
        ];
    }
}

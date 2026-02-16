<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
   try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
            }
            if (!$this->checkIfNMRA($user)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized - NMRA access required'
                ], 401);
            }
            $reports = DB::table('nmra_reports')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $reports,
                'count' => $reports->count()
            ]);
            } catch (\Exception $e) {
            return response()->json(['status' => false,'message' => 'Error fetching reports'], 500);
        }
    }

    public function generate(Request $request)
{
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json(['status' => false,'message' => 'No authenticated user'], 401);
        }

        if (!$this->checkIfNMRA($user)) {
            return response()->json(['status' => false,'message' => 'Unauthorized - NMRA access required'], 401);
        }

        $validated = $request->validate([
            'report_type' => 'required|string|in:pharmacist_registrations,rare_medicines,orders_summary',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'required|in:pdf'
        ]);

        $data = $this->getReportData(
            $validated['report_type'],
            $validated['start_date'],
            $validated['end_date']
        );

        return $this->generatePdf($validated['report_type'], $data, $validated['start_date'], $validated['end_date'], $user);

    } catch (\Exception $e) {
   return response()->json([
            'status' => false, 'message' => 'Error generating report'], 500);
    }
}

private function getPharmacistRegistrations($startDate, $endDate)
{
    $pharmacists = DB::table('users')
        ->whereIn('user_type', ['pharmacist'])
        ->whereBetween('created_at', [$startDate, $endDate])
        ->orderBy('created_at', 'desc')
        ->get();
    $result = [];

    foreach ($pharmacists as $user) {
        $pharmacistStatus = $user->pharmacist_status ?? 'pending';

        if (strtotime($pharmacistStatus) !== false) {
            $pharmacistStatus = 'pending';
        }
        //get pharmacy information
        $pharmacyName = 'N/A';
        $pharmacyAddress = 'N/A';

        if (!empty($user->pharmacy_id) && DB::getSchemaBuilder()->hasTable('pharmacies')) {
            $pharmacy = DB::table('pharmacies')->where('id', $user->pharmacy_id)->first();
            if ($pharmacy) {
                $pharmacyName = $pharmacy->name ?? $pharmacy->pharmacy_name ?? 'N/A';
                $pharmacyAddress = $pharmacy->address ?? 'N/A';
            }
        }
        //full name
        $fullName = 'N/A';
        if (!empty($user->first_name) || !empty($user->last_name)) {
            $fullName = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
        } elseif (!empty($user->pharmacist_name)) {
            $fullName = $user->pharmacist_name;}

        $item = [
            'id' => $user->id ?? 'N/A',
            'pharmacist_name' => $user->pharmacist_name ?? 'N/A',
            'full_name' => $fullName,
            'email' => $user->email ?? 'N/A',
            'slmc_reg_no' => $user->slmc_reg_no ?? 'N/A',
            'contact_no' => $user->contact_no ?? 'N/A',
            'pharmacist_status' => ucfirst($pharmacistStatus), //uppercase first
            'pharmacy_name' => $pharmacyName,
            'pharmacy_address' => $pharmacyAddress,
            'registration_date' => !empty($user->created_at) ? date('Y-m-d H:i:s', strtotime($user->created_at)) : 'N/A',
                    'approved_at' => !empty($user->approved_at) ? date('Y-m-d H:i:s', strtotime($user->approved_at)) : 'N/A',];
               //approver info if approved_by exists
            if (!empty($user->approved_by)) {
                $approver = DB::table('users')->where('id', $user->approved_by)->first();
                if ($approver) {
                    $item['approved_by_email'] = $approver->email;}
            }
            $result[] = $item;
        }return $result;
    }

    private function getRareMedicines($startDate, $endDate)
    {
        if (!DB::getSchemaBuilder()->hasTable('rare_medicine')) {
            return []; }

        try {
            $rareMedicines = DB::table('rare_medicine')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'desc')
                ->get();
            $processedMedicines = [];

            foreach ($rareMedicines as $medicine) {
                $unitPrice = $medicine->unit_price ?? 0;
                $quantity = $medicine->quantity ?? 0;

                $result = [
                    'id' => $medicine->rare_id ?? $medicine->id ?? 'N/A',
                    'medicine_name' => $medicine->medicine_name ?? 'N/A',
                    'dosage_form' => $medicine->dosage_form ?? 'N/A',
                    'strength' => $medicine->strength ?? 'N/A',
                    'quantity' => $quantity,
                    'unit_price' => number_format($unitPrice, 2),
                    'total_value' => number_format($quantity * $unitPrice, 2),
                    'status' => 'Active',
                    'registration_date' => !empty($medicine->created_at) ? date('Y-m-d H:i:s', strtotime($medicine->created_at)) : 'N/A',
                    'created_at' => !empty($medicine->created_at) ? date('Y-m-d H:i:s', strtotime($medicine->created_at)) : 'N/A',
                    'updated_at' => !empty($medicine->updated_at) ? date('Y-m-d H:i:s', strtotime($medicine->updated_at)) : 'N/A'
                ];
                $processedMedicines[] = $result;
            }
            return $processedMedicines;
        } catch (\Exception $e) {
            return [];}
    }

    private function getOrdersSummary($startDate, $endDate)
    {
        if (!DB::getSchemaBuilder()->hasTable('orders')) {
            return [];}

        try {
            $orders = DB::table('orders')
                ->whereBetween('order_date', [$startDate, $endDate])
                ->orderBy('order_date', 'desc')
                ->get();
            $processedOrders = [];

            foreach ($orders as $order) {
                $pharmacyName = 'N/A';
                $pharmacyAddress = 'N/A';

                if (!empty($order->pharmacy_id) && DB::getSchemaBuilder()->hasTable('pharmacies')) {
                    $pharmacy = DB::table('pharmacies')->where('id', $order->pharmacy_id)->first();
                    if ($pharmacy) {
                        $pharmacyName = $pharmacy->name ?? $pharmacy->pharmacy_name ?? 'N/A';
                        $pharmacyAddress = $pharmacy->address ?? 'N/A';}
                }

                $approvedByName = 'N/A';
                $approvedByEmail = 'N/A';

                if (!empty($order->approved_by)) {
                    $approver = DB::table('users')->where('id', $order->approved_by)->first();
                    if ($approver) {
                        $approvedByEmail = $approver->email ?? 'N/A';

                if (!empty($approver->first_name) || !empty($approver->last_name)) {
                            $approvedByName = trim(($approver->first_name ?? '') . ' ' . ($approver->last_name ?? ''));
                        } elseif (!empty($approver->name))
                        {$approvedByName = $approver->name;}
                    }
                }

                $rejectedByName = 'N/A';
                $rejectedByEmail = 'N/A';

                if (!empty($order->rejected_by)) {
                    $rejecter = DB::table('users')->where('id', $order->rejected_by)->first();
                    if ($rejecter) {
                        $rejectedByEmail = $rejecter->email ?? 'N/A';

                        if (!empty($rejecter->first_name) || !empty($rejecter->last_name)) {
                            $rejectedByName = trim(($rejecter->first_name ?? '') . ' ' . ($rejecter->last_name ?? ''));
                        } elseif (!empty($rejecter->name))
                        { $rejectedByName = $rejecter->name;}
                    }
                }

                $item = [
                    'prescription_id' => $order->prescription_id ?? 0,
                    'rare_id' => $order->rare_id ?? 0,
                    'customer_name' => $order->name ?? 'N/A',
                    'customer_address' => $order->address ?? 'N/A',
                    'contact_no' => $order->contact_no ?? 'N/A',
                    'quantity' => $order->quantity ?? 0,
                    'order_date' => !empty($order->order_date) ? date('Y-m-d H:i:s', strtotime($order->order_date)) : 'N/A',
                    'pharmacy' => $pharmacyName,
                    'pharmacy_address' => $pharmacyAddress,
                    'status' => ucfirst($order->status ?? 'N/A'),
                    'approved_at' => !empty($order->approved_at) ? date('Y-m-d H:i:s', strtotime($order->approved_at)) : 'N/A',
                    'approved_by' => $order->approved_by ?? 'N/A',];

                $processedOrders[] = $item;
            }return $processedOrders;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function generatePdf($reportType, $data, $startDate, $endDate, $user)
    {
        try {
            $reportName = $this->getReportName($reportType);
            $fileName = strtolower(str_replace(' ', '_', $reportName)) . '_' . date('Y_m_d_H_i_s') . '.pdf';

            $pdfData = ['report_name' => $reportName,
                        'report_type' => $reportType,
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'generated_by' => $user->name ?? $user->email,
                        'generated_at' => now()->format('Y-m-d H:i:s'),
                        'data' => $data,
                        'record_count' => is_array($data) ? count($data) : 0,
                        'columns' => !empty($data) && is_array($data) && count($data) > 0 //allow blade template to loop over data dynamically
                                    ? array_keys((array)$data[0]): []];

            $this->saveReportToDatabase($reportType, $startDate, $endDate, 'pdf', $user, $pdfData['record_count']);

            $pdf = Pdf::loadView('reports.pdf_template', $pdfData);
            $pdf->setPaper('A4', 'landscape');

            $pdf->setOptions([
                'defaultFont' => 'arial','defaultFontSize' => 8, 'isHtml5ParserEnabled' => true, 'isRemoteEnabled' => true ]); //allow images from URLs

            return $pdf->download($fileName);

        } catch (\Exception $e) {
            throw $e;
        }
    }

    private function saveReportToDatabase($reportType, $startDate, $endDate, $format, $user, $recordCount)
    {
        if (DB::getSchemaBuilder()->hasTable('nmra_reports')) {
            $reportId = DB::table('nmra_reports')->insertGetId([
                'report_name' => $this->getReportName($reportType),
                'report_type' => $reportType,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'format' => $format,
                'record_count' => $recordCount,
                'generated_by' => $user->id,
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now()]);
            return $reportId;
        }
        return null;
    }

    private function getReportData(string $reportType, string $startDate, string $endDate)
    {
        $startDate = date('Y-m-d 00:00:00', strtotime($startDate));
        $endDate = date('Y-m-d 23:59:59', strtotime($endDate));

        switch ($reportType) {
            case 'pharmacist_registrations':
                return $this->getPharmacistRegistrations($startDate, $endDate);
            case 'rare_medicines':
                return $this->getRareMedicines($startDate, $endDate);
            case 'orders_summary':
                return $this->getOrdersSummary($startDate, $endDate);
            default:
                return [];
        }
    }

    private function checkIfNMRA($user)
    {
        if (!empty($user->user_type)) {
            $userType = strtolower($user->user_type);
            if (str_contains($userType, 'nmra')) {
                return true;
            }
        }
        if (!empty($user->nmra_id)) {
            return true;
        }
        return false;
    }

    private function getReportName(string $reportType): string //map report types to human readable names
    {
        $names = [
            'pharmacist_registrations' => 'Pharmacist Registrations Report',
            'rare_medicines' => 'Rare Medicines Report',
            'orders_summary' => 'Orders Summary Report'
        ];
        return $names[$reportType] ?? 'NMRA Report';
    }
}

import DoctorPOS from '@/components/pos/DoctorPOS';

export const metadata = {
    title: 'Doctor POS - Family Clinic',
    description: 'Point of Sale for doctors to prescribe medicines and manage patient bills.',
};

export default function POSPage() {
    return (
        <main className="min-h-screen bg-slate-50/50">
            <div className="container mx-auto py-6 px-4">
                <div className="mb-6 px-4">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bác sĩ - Kê đơn & Tính tiền</h1>
                    <p className="text-muted-foreground mt-1">
                        Tìm kiếm thuốc, tạo đơn hàng và tự động trừ kho real-time.
                    </p>
                </div>

                <DoctorPOS />
            </div>
        </main>
    );
}

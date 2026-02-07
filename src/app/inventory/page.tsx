'use client';

import { Plus } from 'lucide-react';
import InventoryTable from '@/components/inventory/InventoryTable';
import { Button } from '@/components/ui/button';

export default function InventoryPage() {
    const handleAddMedicine = () => {
        console.log('Open Add Medicine Modal');
        alert('Add Medicine functionality coming soon!');
    };

    return (
        <main className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý kho thuốc</h1>
                    <p className="text-muted-foreground mt-1">
                        Xem và cập nhật danh mục thuốc, giá bán và số lượng tồn kho.
                    </p>
                </div>
                <Button onClick={handleAddMedicine} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" /> Thêm thuốc mới
                </Button>
            </div>

            <InventoryTable />
        </main>
    );
}

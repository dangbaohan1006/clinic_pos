import InventoryTable from '@/components/inventory/InventoryTable';

export default function InventoryPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý kho thuốc</h1>
                <p className="text-slate-500 mt-2">
                    Xem và cập nhật danh mục thuốc, giá bán và số lượng tồn kho.
                </p>
            </div>

            {/* Chỉ hiển thị bảng (Logic nút thêm thuốc nằm bên trong component này) */}
            <InventoryTable />
        </div>
    );
}
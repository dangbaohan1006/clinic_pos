'use client';

import { useEffect, useState, useCallback } from 'react';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Medicine } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function InventoryTable() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // Nếu editingMedicine = null (hoặc id = undefined) nghĩa là đang Thêm mới
    const [formData, setFormData] = useState<Partial<Medicine>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchMedicines = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('medicines')
                .select('*')
                .eq('active', true)
                .order('id', { ascending: true });

            if (error) {
                toast.error('Lỗi tải dữ liệu: ' + error.message);
            } else {
                setMedicines(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    // Hàm mở Dialog THÊM MỚI
    const openAddModal = () => {
        setFormData({}); // Reset form trắng
        setIsDialogOpen(true); // Mở Dialog
    };

    // Hàm mở Dialog SỬA
    const openEditModal = (medicine: Medicine) => {
        setFormData(medicine); // Điền dữ liệu cũ
        setIsDialogOpen(true); // Mở Dialog
    };

    const handleSave = async () => {
        // Validate
        if (!formData.name || !formData.unit || formData.price === undefined) {
            toast.error("Vui lòng nhập tên, đơn vị và giá!");
            return;
        }

        try {
            setIsSaving(true);

            if (formData.id) {
                // --- LOGIC SỬA (UPDATE) ---
                const { error } = await supabase
                    .from('medicines')
                    .update({
                        price: formData.price,
                        quantity: formData.quantity,
                        unit: formData.unit,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', formData.id);
                if (error) throw error;
                toast.success('Cập nhật thành công!');
            } else {
                // --- LOGIC THÊM MỚI (INSERT) ---
                const { error } = await supabase
                    .from('medicines')
                    .insert([{
                        name: formData.name,
                        unit: formData.unit,
                        price: formData.price,
                        quantity: formData.quantity || 0,
                        active: true
                    }]);
                if (error) throw error;
                toast.success('Thêm thuốc mới thành công!');
            }

            setIsDialogOpen(false); // Đóng Dialog
            fetchMedicines(); // Tải lại bảng
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error('Lỗi: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa thuốc này không?')) return;

        const { error } = await supabase
            .from('medicines')
            .update({ active: false })
            .eq('id', id);

        if (error) {
            toast.error("Lỗi xóa: " + error.message);
        } else {
            toast.success("Đã xóa thuốc");
            fetchMedicines();
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <h2 className="text-lg font-semibold">Kho Thuốc ({medicines.length})</h2>
                {/* Nút Thêm Thuốc */}
                <Button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Thêm thuốc mới
                </Button>
            </div>

            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Tên thuốc</TableHead>
                            <TableHead>Đơn vị</TableHead>
                            <TableHead className="text-right">Giá bán</TableHead>
                            <TableHead className="text-right">Tồn kho</TableHead>
                            <TableHead className="text-center w-[120px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">Đang tải...</TableCell></TableRow>
                        ) : medicines.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24 italic">Kho trống</TableCell></TableRow>
                        ) : (
                            medicines.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                    <TableCell className={`text-right font-bold ${item.quantity < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}>
                                            <Edit className="h-4 w-4 text-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog Form */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{formData.id ? 'Cập nhật thuốc' : 'Thêm thuốc mới'}</DialogTitle>
                        <DialogDescription>Nhập thông tin chi tiết bên dưới.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tên thuốc</Label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!!formData.id}
                                className="col-span-3"
                                placeholder="Ví dụ: Panadol Extra"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Đơn vị</Label>
                            <Input
                                value={formData.unit || ''}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="col-span-3"
                                placeholder="Viên / Vỉ / Hộp"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Giá bán</Label>
                            <Input
                                type="number"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Tồn kho</Label>
                            <Input
                                type="number"
                                value={formData.quantity || ''}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {formData.id ? 'Lưu thay đổi' : 'Thêm thuốc'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
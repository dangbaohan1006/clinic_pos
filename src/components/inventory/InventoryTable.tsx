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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';

export default function InventoryTable() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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

    const openAddModal = () => {
        setFormData({});
        setIsDialogOpen(true);
    };

    const openEditModal = (medicine: Medicine) => {
        setFormData(medicine);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.unit || formData.price === undefined) {
            toast.error("Vui lòng nhập tên, chọn đơn vị và nhập giá!");
            return;
        }

        try {
            setIsSaving(true);

            if (formData.id) {
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

            setIsDialogOpen(false);
            fetchMedicines();
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{formData.id ? 'Cập nhật thuốc' : 'Thêm thuốc mới'}</DialogTitle>
                        <DialogDescription>Nhập thông tin chi tiết bên dưới.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Tên thuốc */}
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

                        {/* Đơn vị - Dropdown Select */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Đơn vị</Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.unit}
                                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn đơn vị" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Viên">Viên</SelectItem>
                                        <SelectItem value="Vỉ">Vỉ</SelectItem>
                                        <SelectItem value="Hộp">Hộp</SelectItem>
                                        <SelectItem value="Chai">Chai</SelectItem>
                                        <SelectItem value="Lọ">Lọ</SelectItem>
                                        <SelectItem value="Gói">Gói</SelectItem>
                                        <SelectItem value="Tuýp">Tuýp</SelectItem>
                                        <SelectItem value="Ống">Ống</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Giá bán */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Giá bán</Label>
                            <Input
                                type="number"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>

                        {/* Tồn kho */}
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
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Edit, Loader2 } from 'lucide-react';
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchMedicines = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('medicines')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                toast.error('Lỗi khi tải danh sách thuốc: ' + error.message);
            } else {
                setMedicines(data || []);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const handleEdit = (medicine: Medicine) => {
        setEditingMedicine({ ...medicine });
        setIsEditDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingMedicine) return;

        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('medicines')
                .update({
                    price: editingMedicine.price,
                    quantity: editingMedicine.quantity,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editingMedicine.id);

            if (error) {
                toast.error('Lỗi khi cập nhật: ' + error.message);
            } else {
                toast.success('Cập nhật thành công!');
                setIsEditDialogOpen(false);
                fetchMedicines();
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Đã xảy ra lỗi không xác định.');
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading && medicines.length === 0) {
        return <div className="p-8 text-center text-muted-foreground italic">Đang tải danh sách thuốc...</div>;
    }

    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm">
            <Table className="border-collapse">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Tên thuốc</TableHead>
                        <TableHead>Đơn vị</TableHead>
                        <TableHead className="text-right">Giá bán</TableHead>
                        <TableHead className="text-right">Tồn kho</TableHead>
                        <TableHead>Cập nhật lần cuối</TableHead>
                        <TableHead className="text-center w-[100px]">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {medicines.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground italic">
                                Chưa có thuốc nào trong kho.
                            </TableCell>
                        </TableRow>
                    ) : (
                        medicines.map((medicine, index) => (
                            <TableRow
                                key={medicine.id}
                                className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                            >
                                <TableCell className="font-medium">{medicine.id}</TableCell>
                                <TableCell>{medicine.name}</TableCell>
                                <TableCell>{medicine.unit}</TableCell>
                                <TableCell className="text-right">{formatCurrency(medicine.price)}</TableCell>
                                <TableCell className="text-right font-semibold">
                                    {medicine.quantity}
                                </TableCell>
                                <TableCell>{formatDate(medicine.updated_at)}</TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(medicine)}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa thông tin thuốc</DialogTitle>
                        <DialogDescription>
                            Thay đổi giá bán và số lượng tồn kho của thuốc. Nhấn lưu để áp dụng thay đổi.
                        </DialogDescription>
                    </DialogHeader>
                    {editingMedicine && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Tên thuốc
                                </Label>
                                <Input
                                    id="name"
                                    value={editingMedicine.name}
                                    disabled
                                    className="col-span-3 bg-muted"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">
                                    Giá bán
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={editingMedicine.price}
                                    onChange={(e) => setEditingMedicine({ ...editingMedicine, price: Number(e.target.value) })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quantity" className="text-right">
                                    Tồn kho
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={editingMedicine.quantity}
                                    onChange={(e) => setEditingMedicine({ ...editingMedicine, quantity: Number(e.target.value) })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

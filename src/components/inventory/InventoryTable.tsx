'use client';

import { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
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

export default function InventoryTable() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMedicines() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('medicines')
                    .select('*')
                    .order('id', { ascending: true });

                if (error) {
                    console.error('Error fetching medicines:', error);
                } else {
                    setMedicines(data || []);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMedicines();
    }, []);

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

    if (loading) {
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
                                        onClick={() => console.log('Edit medicine:', medicine.id)}
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
        </div>
    );
}

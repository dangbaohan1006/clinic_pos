'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, History, Package } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho Transaction
interface Transaction {
    id: string;
    total_amount: number;
    created_at: string;
    items: any[]; // JSONB chứa danh sách thuốc
}

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .order('created_at', { ascending: false }); // Mới nhất lên đầu

                if (error) throw error;
                setTransactions(data || []);
            } catch (err) {
                console.error('Lỗi tải lịch sử:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-100 rounded-full">
                    <History className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lịch sử bán hàng</h1>
                    <p className="text-slate-500">Xem lại các đơn thuốc đã kê và doanh thu.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle>Danh sách giao dịch ({transactions.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Thời gian</TableHead>
                                <TableHead>Chi tiết đơn thuốc</TableHead>
                                <TableHead className="text-right">Tổng tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải dữ liệu...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center text-slate-400 italic">
                                        Chưa có giao dịch nào được ghi nhận.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id} className="hover:bg-slate-50/50">
                                        <TableCell className="align-top py-4 font-medium text-slate-600">
                                            {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            <div className="text-xs text-slate-400 mt-1 font-normal uppercase">ID: {tx.id.slice(0, 8)}</div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-2">
                                                {Array.isArray(tx.items) && tx.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        <Package className="h-3 w-3 text-slate-400" />
                                                        <span className="font-semibold text-slate-700">{item.name || `Thuốc ID ${item.id}`}</span>
                                                        <Badge variant="secondary" className="text-xs font-normal">
                                                            SL: {item.buyQuantity}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-4 text-right">
                                            <span className="font-bold text-emerald-600 text-lg">
                                                {formatCurrency(tx.total_amount)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
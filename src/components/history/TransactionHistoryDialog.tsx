'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TransactionHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TransactionHistoryDialog({ open, onOpenChange }: TransactionHistoryDialogProps) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            fetchHistory();
        }
    }, [open]);

    const fetchHistory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (!error) {
            setTransactions(data || []);
        }
        setLoading(false);
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* THAY ĐỔI Ở ĐÂY: sm:max-w-[900px] giúp popup rộng ra thoải mái */}
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 border-b bg-slate-50 rounded-t-lg">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        Lịch sử giao dịch
                    </DialogTitle>
                    <p className="text-slate-500">20 đơn hàng gần nhất của phòng khám.</p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="border rounded-lg shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-100">
                                <TableRow>
                                    <TableHead className="w-[150px] font-bold">Thời gian</TableHead>
                                    <TableHead className="font-bold">Chi tiết đơn thuốc</TableHead>
                                    <TableHead className="text-right font-bold w-[150px]">Tổng tiền</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center">
                                            <div className="flex justify-center items-center gap-2 text-slate-500">
                                                <Loader2 className="h-5 w-5 animate-spin" /> Đang tải dữ liệu...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-slate-500 italic">
                                            Chưa có giao dịch nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Cột Thời gian */}
                                            <TableCell className="align-top py-4">
                                                <div className="font-medium text-slate-700">
                                                    {format(new Date(tx.created_at), 'HH:mm', { locale: vi })}
                                                </div>
                                                <div className="text-sm text-slate-400">
                                                    {format(new Date(tx.created_at), 'dd/MM/yyyy', { locale: vi })}
                                                </div>
                                            </TableCell>

                                            {/* Cột Chi tiết thuốc */}
                                            <TableCell className="py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray(tx.items) && tx.items.map((item: any, idx: number) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="outline"
                                                            className="px-3 py-1 bg-white border-slate-200 text-sm font-normal text-slate-700 shadow-sm"
                                                        >
                                                            <span className="font-bold text-slate-900 mr-1">
                                                                {item.name || `Thuốc #${item.id}`}
                                                            </span>
                                                            <span className="text-slate-300 mx-1">|</span>
                                                            <span className="text-blue-600 font-medium">x{item.buyQuantity}</span>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>

                                            {/* Cột Tổng tiền */}
                                            <TableCell className="align-top py-4 text-right">
                                                <div className="font-bold text-emerald-600 text-lg">
                                                    {formatCurrency(tx.total_amount)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
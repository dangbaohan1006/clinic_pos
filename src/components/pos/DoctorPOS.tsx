'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, Loader2, Pill, CheckCircle2, Receipt, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Medicine, CartItem } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import TransactionHistoryDialog from '@/components/history/TransactionHistoryDialog';
import { History } from 'lucide-react';

export default function DoctorPOS() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Medicine[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // State mới: Popup xác nhận hóa đơn
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // State cho Popup thành công
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [lastOrderTotal, setLastOrderTotal] = useState(0);

    // --- 1. Logic Tìm kiếm ---
    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const { data, error } = await supabase
                .from('medicines')
                .select('*')
                .ilike('name', `%${query}%`)
                .eq('active', true)
                .limit(5);

            if (error) {
                toast.error('Lỗi tìm kiếm: ' + error.message);
            } else {
                setSearchResults(data || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    // --- 2. Logic Giỏ hàng ---
    const addToCart = (medicine: Medicine) => {
        if (medicine.quantity <= 0) {
            toast.error(`Thuốc ${medicine.name} đã hết hàng!`);
            return;
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === medicine.id);
            if (existingItem) {
                if (existingItem.buyQuantity + 1 > medicine.quantity) {
                    toast.warning(`Kho chỉ còn ${medicine.quantity} ${medicine.unit}. Không thể bán thêm.`);
                    return prevCart;
                }
                return prevCart.map((item) =>
                    item.id === medicine.id ? { ...item, buyQuantity: item.buyQuantity + 1 } : item
                );
            }
            return [...prevCart, { ...medicine, buyQuantity: 1 }];
        });

        setSearchQuery('');
        setSearchResults([]);
    };

    const removeFromCart = (id: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity <= 0) return;

        setCart((prevCart) => {
            return prevCart.map((item) => {
                if (item.id === id) {
                    if (newQuantity > item.quantity) {
                        toast.warning(`Kho chỉ còn ${item.quantity} ${item.unit}.`);
                        return { ...item, buyQuantity: item.quantity };
                    }
                    return { ...item, buyQuantity: newQuantity };
                }
                return item;
            });
        });
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.buyQuantity, 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    // --- 3. Logic: BƯỚC 1 - Bấm nút thanh toán -> Mở Bill ---
    const handlePreCheckout = () => {
        if (cart.length === 0) {
            toast.error('Giỏ hàng trống!');
            return;
        }
        setIsConfirmOpen(true); // Mở popup hóa đơn
    };

    // --- 4. Logic: BƯỚC 2 - Xác nhận thật -> Gọi API trừ kho ---
    const handleFinalCheckout = async () => {
        try {
            setIsCheckingOut(true);

            // Payload gửi đi
            const payload = cart.map(item => ({
                id: item.id,
                buyQuantity: item.buyQuantity,
                name: item.name,
                price: item.price
            }));

            const { data, error } = await supabase.rpc('process_order', {
                cart_items: payload
            });

            if (error) {
                console.error("RPC Error:", error);
                toast.error('Lỗi giao dịch: ' + error.message);
                setIsConfirmOpen(false); // Đóng Bill nếu lỗi
            } else if (data && data.success) {
                setLastOrderTotal(totalAmount);
                setCart([]);
                setIsConfirmOpen(false); // Đóng Bill
                setIsSuccessOpen(true);  // Mở Popup Thành công
            } else {
                toast.error('Thất bại: ' + (data?.message || 'Lỗi không xác định'));
                setIsConfirmOpen(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Đã xảy ra lỗi hệ thống.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-8 h-[calc(100vh-80px)]">
            {/* Cột Trái: Tìm kiếm */}
            <Card className="flex flex-col h-full border-slate-200 shadow-sm">
                <CardHeader className="bg-white border-b pb-4 rounded-t-xl flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl text-emerald-700">
                            <ShoppingCart className="h-6 w-6" />
                            Tìm kiếm thuốc
                        </CardTitle>
                        <CardDescription>Nhập tên thuốc để thêm vào đơn hàng</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="relative">
                        <Input
                            placeholder="Nhập tên thuốc... (VD: Panadol)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 text-lg"
                        />
                        <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        {isSearching && (
                            <div className="absolute right-3 top-3.5">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 mt-4">
                        {searchResults.length > 0 ? (
                            searchResults.map((medicine) => (
                                <div
                                    key={medicine.id}
                                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 hover:border-blue-200 cursor-pointer transition-all group"
                                    onClick={() => addToCart(medicine)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <Pill className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">{medicine.name}</div>
                                            <div className="text-sm text-slate-500">
                                                {medicine.unit} • <span className="text-emerald-600 font-medium">{formatCurrency(medicine.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${medicine.quantity < 10 ? 'text-red-500' : 'text-slate-600'}`}>
                                            Kho: {medicine.quantity}
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-blue-600 mt-1 h-7">
                                            + Thêm
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : searchQuery.trim() && !isSearching ? (
                            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                                Không tìm thấy thuốc phù hợp
                            </div>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {/* Cột Phải: Giỏ hàng */}
            <Card className="flex flex-col h-full border-slate-200 shadow-sm bg-slate-50/50">
                <CardHeader className="bg-white border-b pb-4 rounded-t-xl flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl text-emerald-700">
                            <ShoppingCart className="h-6 w-6" />
                            Đơn hàng hiện tại
                        </CardTitle>
                        <CardDescription>Danh sách thuốc bác sĩ kê đơn</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
                        <History className="h-4 w-4 mr-2" /> Lịch sử
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-0">
                    {cart.length > 0 ? (
                        <Table>
                            <TableHeader className="bg-slate-100 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="pl-6">Thuốc</TableHead>
                                    <TableHead className="w-[100px] text-center">SL</TableHead>
                                    <TableHead className="text-right pr-6">Thành tiền</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.map((item) => (
                                    <TableRow key={item.id} className="bg-white hover:bg-slate-50">
                                        <TableCell className="pl-6 py-4">
                                            <div className="font-medium text-slate-900">{item.name}</div>
                                            <div className="text-xs text-slate-500">{formatCurrency(item.price)} / {item.unit}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.buyQuantity}
                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                className="w-20 h-9 text-center mx-auto"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-700 pr-6">
                                            {formatCurrency(item.price * item.buyQuantity)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                            <ShoppingCart className="h-16 w-16 opacity-20" />
                            <p className="italic">Chưa có thuốc nào trong đơn hàng</p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-white rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between w-full items-baseline px-2">
                        <span className="text-lg font-medium text-slate-600">Tổng cộng:</span>
                        <span className="text-3xl font-bold text-blue-600">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                    {/* Nút này bây giờ chỉ mở Bill xem trước, KHÔNG trừ kho ngay */}
                    <Button
                        className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg transition-all active:scale-[0.98]"
                        disabled={isCheckingOut || cart.length === 0}
                        onClick={handlePreCheckout}
                    >
                        <CreditCard className="mr-2 h-6 w-6" />
                        Thanh toán
                    </Button>
                </CardFooter>
            </Card>

            {/* --- POPUP 1: XÁC NHẬN HÓA ĐƠN (BILL) --- */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl border-b pb-4">
                            <Receipt className="h-6 w-6 text-slate-600" />
                            Xác nhận đơn hàng
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Vui lòng kiểm tra kỹ đơn thuốc trước khi in bill và trừ kho.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Nội dung Bill */}
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200 max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-500 border-b">
                                    <th className="text-left pb-2 font-medium">Thuốc</th>
                                    <th className="text-center pb-2 font-medium">SL</th>
                                    <th className="text-right pb-2 font-medium">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, idx) => (
                                    <tr key={idx} className="border-b border-dashed border-slate-200 last:border-0">
                                        <td className="py-2 text-slate-700 font-medium">{item.name}</td>
                                        <td className="py-2 text-center text-slate-600">x{item.buyQuantity}</td>
                                        <td className="py-2 text-right font-bold text-slate-700">
                                            {formatCurrency(item.price * item.buyQuantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center px-2 py-2">
                        <span className="text-lg font-bold text-slate-700">Tổng thanh toán:</span>
                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</span>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="w-full sm:w-auto">
                            <X className="mr-2 h-4 w-4" /> Quay lại
                        </Button>
                        <Button
                            onClick={handleFinalCheckout}
                            disabled={isCheckingOut}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isCheckingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Xác nhận và trừ kho
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- POPUP 2: THÔNG BÁO THÀNH CÔNG --- */}
            <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center justify-center py-6 gap-4">
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl font-bold text-slate-900">
                                Giao dịch thành công!
                            </DialogTitle>
                            <DialogDescription className="text-center text-lg text-slate-600">
                                Hệ thống đã trừ kho và lưu lịch sử.
                            </DialogDescription>
                            <div className="bg-slate-50 p-4 rounded-lg mt-4 w-full border border-slate-100">
                                <div className="text-center text-slate-500 text-sm mb-1">Tổng tiền đã thu</div>
                                <div className="text-center text-3xl font-bold text-blue-600">
                                    {formatCurrency(lastOrderTotal)}
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="sm:justify-center w-full">
                        <Button
                            onClick={() => setIsSuccessOpen(false)}
                            className="bg-slate-900 hover:bg-slate-800 w-full h-12 text-lg"
                        >
                            Đóng và tiếp tục đơn mới
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* POPUP LỊCH SỬ */}
            <TransactionHistoryDialog
                open={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
            />
        </div>
    );
}
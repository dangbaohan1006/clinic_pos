'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, Loader2, Pill } from 'lucide-react';
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
import { toast } from 'sonner';

export default function DoctorPOS() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Medicine[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // --- 1. Logic Tìm kiếm (Real-time Search) ---
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
                .ilike('name', `%${query}%`) // Tìm gần đúng theo tên
                .eq('active', true)          // Chỉ lấy thuốc đang kinh doanh
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

    // Debounce: Chỉ tìm kiếm sau khi ngừng gõ 300ms
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    // --- 2. Logic Giỏ hàng ---
    const addToCart = (medicine: Medicine) => {
        // Kiểm tra tồn kho trước khi thêm
        if (medicine.quantity <= 0) {
            toast.error(`Thuốc ${medicine.name} đã hết hàng!`);
            return;
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === medicine.id);
            if (existingItem) {
                // Nếu đã có trong giỏ, kiểm tra xem thêm 1 đơn vị nữa có vượt quá kho không
                if (existingItem.buyQuantity + 1 > medicine.quantity) {
                    toast.warning(`Kho chỉ còn ${medicine.quantity} ${medicine.unit}. Không thể bán thêm.`);
                    return prevCart;
                }
                return prevCart.map((item) =>
                    item.id === medicine.id ? { ...item, buyQuantity: item.buyQuantity + 1 } : item
                );
            }
            // Nếu chưa có, thêm mới
            return [...prevCart, { ...medicine, buyQuantity: 1 }];
        });

        // Reset tìm kiếm để bác sĩ nhập thuốc tiếp theo
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeFromCart = (id: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity <= 0) return; // Không cho nhập số âm hoặc 0

        setCart((prevCart) => {
            return prevCart.map((item) => {
                if (item.id === id) {
                    // Chặn nhập quá số lượng tồn kho
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

    // --- 3. Logic Thanh toán (Quan trọng nhất) ---
    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Giỏ hàng trống!');
            return;
        }

        try {
            setIsCheckingOut(true);

            // Chuẩn bị dữ liệu gửi xuống Database Function
            // Payload này phải khớp KEY với code SQL: item->>'id' và item->>'buyQuantity'
            const payload = cart.map(item => ({
                id: item.id,
                buyQuantity: item.buyQuantity
            }));

            // Gọi hàm RPC 'process_order'
            const { data, error } = await supabase.rpc('process_order', {
                cart_items: payload
            });

            if (error) {
                console.error("RPC Error:", error);
                toast.error('Lỗi giao dịch: ' + error.message);
            } else if (data && data.success) {
                // Giao dịch thành công
                toast.success('Thanh toán thành công! Đã trừ kho.');
                setCart([]); // Xóa giỏ hàng
            } else {
                // Giao dịch thất bại do logic (ví dụ hết hàng giữa chừng)
                toast.error('Thất bại: ' + (data?.message || 'Lỗi không xác định'));
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
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Search className="h-5 w-5 text-blue-600" />
                        Tìm kiếm thuốc
                    </CardTitle>
                    <CardDescription>Nhập tên thuốc để thêm vào đơn hàng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                <CardHeader className="bg-white border-b pb-4 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-xl text-emerald-700">
                        <ShoppingCart className="h-6 w-6" />
                        Đơn hàng hiện tại
                    </CardTitle>
                    <CardDescription>Danh sách thuốc bác sĩ kê đơn</CardDescription>
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
                    <Button
                        className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg transition-all active:scale-[0.98]"
                        disabled={isCheckingOut || cart.length === 0}
                        onClick={handleCheckout}
                    >
                        {isCheckingOut ? (
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        ) : (
                            <CreditCard className="mr-2 h-6 w-6" />
                        )}
                        {isCheckingOut ? 'Đang xử lý...' : 'Thanh toán & Trừ kho'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
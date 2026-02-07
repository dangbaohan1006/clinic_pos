'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, Loader2 } from 'lucide-react';
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

    // Search logic
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
                toast.error('Lỗi khi tìm kiếm thuốc: ' + error.message);
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

    // Cart logic
    const addToCart = (medicine: Medicine) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === medicine.id);
            if (existingItem) {
                if (existingItem.buyQuantity + 1 > medicine.quantity) {
                    toast.warning(`Chỉ còn ${medicine.quantity} ${medicine.unit} trong kho.`);
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

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }

        setCart((prevCart) => {
            return prevCart.map((item) => {
                if (item.id === id) {
                    if (quantity > item.quantity) {
                        toast.warning(`Chỉ còn ${item.quantity} ${item.unit} trong kho.`);
                        return item;
                    }
                    return { ...item, buyQuantity: quantity };
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

    // Checkout logic
    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Giỏ hàng trống!');
            return;
        }

        try {
            setIsCheckingOut(true);

            const payload = cart.map(item => ({
                id: item.id,
                buyQuantity: item.buyQuantity,
            }));

            const { data, error } = await supabase.rpc('process_order', {
                cart_items: payload
            });

            if (error) {
                console.error("RPC Error:", error);
                toast.error('Lỗi hệ thống: ' + error.message);
            } else if (data && data.success) { // Kiểm tra biến success trả về từ SQL
                toast.success(data.message); // "Thanh toán thành công!"
                setCart([]);
            } else {
                // Trường hợp SQL trả về success: false (ví dụ hết hàng)
                toast.error('Lỗi: ' + (data?.message || 'Giao dịch thất bại'));
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Đã xảy ra lỗi không xác định.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-8">
            {/* Left Column: Search & Select */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" /> Tìm kiếm thuốc
                    </CardTitle>
                    <CardDescription>Nhập tên thuốc để thêm vào đơn hàng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Nhập tên thuốc..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        {isSearching && (
                            <div className="absolute right-3 top-2.5">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {searchResults.length > 0 ? (
                            searchResults.map((medicine) => (
                                <div
                                    key={medicine.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => addToCart(medicine)}
                                >
                                    <div className="flex-1">
                                        <div className="font-semibold">{medicine.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {medicine.unit} • {formatCurrency(medicine.price)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`text-sm ${medicine.quantity < 10 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                            Kho: {medicine.quantity}
                                        </div>
                                        <Button size="sm" variant="secondary">Thêm</Button>
                                    </div>
                                </div>
                            ))
                        ) : searchQuery.trim() && !isSearching ? (
                            <div className="text-center py-8 text-muted-foreground">Không tìm thấy kết quả</div>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {/* Right Column: Cart & Checkout */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <ShoppingCart className="h-5 w-5" /> Đơn hàng hiện tại
                    </CardTitle>
                    <CardDescription>Danh sách thuốc bác sĩ kê đơn</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overscroll-y-auto">
                    {cart.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thuốc</TableHead>
                                    <TableHead className="w-[100px]">SL</TableHead>
                                    <TableHead className="text-right">Tổng</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-muted-foreground">{formatCurrency(item.price)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.buyQuantity}
                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                className="w-16 h-8"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(item.price * item.buyQuantity)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500"
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
                        <div className="text-center py-20 text-muted-foreground italic">
                            Chưa có thuốc nào trong đơn hàng
                        </div>
                    )}
                </CardContent>
                {cart.length > 0 && (
                    <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/20">
                        <div className="flex justify-between w-full items-baseline">
                            <span className="text-lg font-medium">Tổng tiền:</span>
                            <span className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                        <Button
                            className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700"
                            disabled={isCheckingOut}
                            onClick={handleCheckout}
                        >
                            {isCheckingOut ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <CreditCard className="mr-2 h-5 w-5" />
                            )}
                            Thanh toán & Trừ kho
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

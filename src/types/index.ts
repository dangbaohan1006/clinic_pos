export interface Medicine {
    id: number;
    name: string;
    unit: string;
    price: number;
    quantity: number; // Tồn kho (Stock)
    active: boolean;
    created_at?: string; // Optional vì khi tạo mới chưa có
    updated_at?: string;
}

export interface CartItem extends Medicine {
    buyQuantity: number; // Số lượng khách mua
}

export interface Transaction {
    id: string;
    total_amount: number;
    created_at: string;
    items: CartItem[]; // JSONB trả về từ DB
}
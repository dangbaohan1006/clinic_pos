-- =============================================================
-- SCRIPT "BẢO HIỂM": KHẮC PHỤC LỖI CONSTRAINT VÀ CẬP NHẬT DỮ LIỆU
-- =============================================================

-- BƯỚC 1: Xóa các dòng trùng tên (nếu lỡ tay nhập nhiều lần) để tạo được ràng buộc duy nhất
DELETE FROM medicines a USING medicines b
WHERE a.id > b.id AND a.name = b.name;

-- BƯỚC 2: Cài đặt ràng buộc DUY NHẤT (UNIQUE) cho cột name
-- Nếu lệnh này báo lỗi "already exists", bạn có thể bỏ qua và chạy tiếp Bước 3.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'medicines_name_key'
    ) THEN
        ALTER TABLE medicines ADD CONSTRAINT medicines_name_key UNIQUE (name);
    END IF;
END $$;

-- BƯỚC 3: NHẬP VÀ CẬP NHẬT DỮ LIỆU (UPSERT)
INSERT INTO medicines (name, unit, price, quantity, active)
VALUES
('Panadol Extra', 'Viên', 1500, 100, true),
('Efferalgan 500mg', 'Viên', 2000, 100, true),
('Hapacol 650', 'Viên', 1200, 100, true),
('Decolgen Forte', 'Viên', 1000, 100, true),
('Tiffy Dey', 'Viên', 800, 100, true),
('Amoxicillin 500mg', 'Viên', 1000, 100, true),
('Augmentin 625mg', 'Viên', 15000, 50, true),
('Berberin 100mg', 'Viên', 200, 500, true),
('Paracetamol 500mg', 'Viên', 500, 200, true),
('Aspirin 81mg', 'Viên', 1000, 100, true),
('Salonpas (Gói 10 miếng)', 'Gói', 12000, 50, true),
('Vitamin C 500mg', 'Viên', 1000, 200, true),
('Vitamin B1', 'Viên', 200, 500, true),
('Vitamin B6', 'Viên', 200, 500, true),
('Vitamin B12', 'Viên', 300, 500, true),
('Strepsils (Gói 2 viên)', 'Gói', 4000, 100, true),
('Dầu gió Trường Sơn (Chai nhỏ)', 'Chai', 15000, 30, true),
('Thuốc ho Bảo Thanh', 'Chai', 35000, 20, true),
('Gaviscon (Gói)', 'Gói', 10000, 50, true),
('Maalox', 'Viên', 2000, 100, true),
('Smecta', 'Gói', 5000, 50, true),
('Enterogermina', 'Ống', 8000, 60, true),
('Biosubtyl-II', 'Gói', 2000, 100, true),
('Cetirizin 10mg', 'Viên', 1000, 100, true),
('Loratadin 10mg', 'Viên', 1000, 100, true),
('Telfast 180mg', 'Viên', 12000, 30, true),
('Zyrtec 10mg', 'Viên', 8000, 30, true),
('Aerius 5mg', 'Viên', 11000, 30, true),
('Prednisolon 5mg', 'Viên', 500, 200, true),
('Dexamethason 0.5mg', 'Viên', 200, 200, true),
('Medrol 4mg (Methylprednisolon)', 'Viên', 4000, 50, true),
('Clopheniramin 4mg', 'Viên', 200, 500, true),
('Salbutamol 2mg', 'Viên', 500, 200, true),
('Ventolin Nebules 2.5mg', 'Ống', 8000, 40, true),
('Symbicort Turbohaler', 'Lọ', 450000, 5, true),
('Seretide Evohaler', 'Lọ', 380000, 5, true),
('Nexium 40mg', 'Viên', 22000, 28, true),
('Losec 20mg', 'Viên', 15000, 20, true),
('Pantoprazol 40mg', 'Viên', 5000, 100, true),
('Rabeprazol 20mg', 'Viên', 8000, 50, true),
('Ciprofloxacin 500mg', 'Viên', 2000, 100, true),
('Levofloxacin 500mg', 'Viên', 15000, 30, true),
('Azithromycin 500mg', 'Viên', 12000, 30, true),
('Clarithromycin 500mg', 'Viên', 10000, 30, true),
('Erythromycin 500mg', 'Viên', 2000, 50, true),
('Cephalexin 500mg', 'Viên', 1500, 100, true),
('Zinnat 500mg (Cefuroxim)', 'Viên', 24000, 20, true),
('Cefixim 200mg', 'Viên', 5000, 50, true),
('Cefpodoxim 200mg', 'Viên', 8000, 50, true),
('Metronidazol 250mg', 'Viên', 500, 200, true),
('Tinidazol 500mg', 'Viên', 2000, 50, true),
('Fugacar (Albendazol)', 'Viên', 20000, 20, true),
('Mebendazol 500mg', 'Viên', 15000, 20, true),
('Diazepam 5mg', 'Viên', 1000, 30, true),
('Sulpirid 50mg', 'Viên', 1000, 50, true),
('Amitriptylin 25mg', 'Viên', 1000, 50, true),
('Enalapril 5mg', 'Viên', 1000, 100, true),
('Captopril 25mg', 'Viên', 1500, 50, true),
('Losartan 50mg', 'Viên', 3000, 100, true),
('Amlodipin 5mg', 'Viên', 1000, 200, true),
('Nifedipin T20', 'Viên', 2000, 100, true),
('Bisoprolol 5mg', 'Viên', 4000, 100, true),
('Atenolol 50mg', 'Viên', 1500, 100, true),
('Glucophage 500mg (Metformin)', 'Viên', 2500, 100, true),
('Diamicron MR 60mg', 'Viên', 5000, 60, true),
('Glimepirid 2mg', 'Viên', 2000, 100, true),
('Lipitor 20mg (Atorvastatin)', 'Viên', 25000, 30, true),
('Crestor 10mg (Rosuvastatin)', 'Viên', 21000, 30, true),
('Fenofibrat 200mg', 'Viên', 3000, 50, true),
('Gemfibrozil 600mg', 'Viên', 5000, 50, true),
('Allopurinol 300mg', 'Viên', 2000, 100, true),
('Colchicin 1mg', 'Viên', 3000, 20, true),
('Celecoxib 200mg', 'Viên', 4000, 50, true),
('Etoricoxib 90mg', 'Viên', 15000, 30, true),
('Voltaren 50mg (Diclofenac)', 'Viên', 4000, 50, true),
('Mobic 7.5mg (Meloxicam)', 'Viên', 18000, 20, true),
('Ibuprofen 400mg', 'Viên', 1500, 100, true),
('Naproxen 250mg', 'Viên', 2000, 50, true),
('Glucosamin 500mg', 'Viên', 3000, 100, true),
('Calcium Corbiere (Ống 10ml)', 'Ống', 8000, 30, true),
('Magnesium B6', 'Viên', 1500, 100, true),
('Enervon-C', 'Viên', 2000, 100, true),
('Tanganil 500mg', 'Viên', 6000, 30, true),
('Tanakan (Ginkgo Biloba)', 'Viên', 5000, 30, true),
('Piracetam 800mg', 'Viên', 2000, 50, true),
('Alpha Choay', 'Viên', 4000, 100, true),
('Serratiopeptidase 10mg', 'Viên', 1500, 100, true),
('Lysozym 90mg', 'Viên', 2000, 100, true),
('Bactroban (Mupirocin) 5g', 'Tuýp', 95000, 10, true),
('Fucidin 15g', 'Tuýp', 120000, 10, true),
('Silkron 10g', 'Tuýp', 25000, 20, true),
('Gentrisone 10g', 'Tuýp', 15000, 20, true),
('Nizoral cream 5g', 'Tuýp', 35000, 10, true),
('Canesten cream 20g', 'Tuýp', 65000, 10, true),
('Terbinafin 250mg', 'Viên', 10000, 20, true),
('Acyclovir 400mg', 'Viên', 2000, 50, true),
('Oresol (Gói)', 'Gói', 2000, 100, true),
('Natri Clorid 0.9% (Chai 500ml)', 'Chai', 10000, 20, true),
('Povidine 20ml', 'Chai', 15000, 20, true),
('Cồn 70 độ (Chai 60ml)', 'Chai', 5000, 50, true),
('Băng cá nhân Urgo (Miếng)', 'Viên', 500, 200, true),
('Khẩu trang y tế (Hộp 50 cái)', 'Hộp', 35000, 20, true)
ON CONFLICT (name) 
DO UPDATE SET 
    unit = EXCLUDED.unit,
    price = EXCLUDED.price,
    quantity = EXCLUDED.quantity,
    active = true;

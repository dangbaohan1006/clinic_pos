import Link from "next/link";
import { Pill, ShoppingCart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-600 rounded-full">
            <Activity className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Hệ Thống Phòng Khám</h1>
        <p className="text-lg text-slate-600">Quản lý kho thuốc & Bán hàng nội bộ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Card Dành cho Bác sĩ */}
        <Link href="/pos" className="group">
          <Card className="h-full hover:shadow-lg transition-all hover:border-blue-500 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-blue-700">
                <ShoppingCart className="h-6 w-6" />
                Bác Sĩ (POS)
              </CardTitle>
              <CardDescription>
                Kê đơn, tính tiền và in hóa đơn tự động
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500">
                Truy cập giao diện bán hàng, tìm kiếm thuốc nhanh và thanh toán trừ kho.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card Dành cho Dược sĩ */}
        <Link href="/inventory" className="group">
          <Card className="h-full hover:shadow-lg transition-all hover:border-emerald-500 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-emerald-700">
                <Pill className="h-6 w-6" />
                Dược Sĩ (Kho)
              </CardTitle>
              <CardDescription>
                Quản lý danh mục thuốc và nhập hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500">
                Xem danh sách tồn kho, cập nhật giá bán và số lượng thuốc mới nhập.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-12 text-sm text-slate-400">
        Phiên bản 1.0.0 - Senior AI Data Engineer
      </div>
    </main>
  );
}
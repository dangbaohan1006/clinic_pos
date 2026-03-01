import Link from "next/link";
import { Pill, ShoppingCart, Activity, History } from "lucide-react"; // Thêm icon History
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

      {/* Sửa grid thành 3 cột nếu màn hình to, hoặc giữ 2 cột tùy ý */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">

        {/* Card 1: Bác sĩ */}
        <Link href="/pos" className="group">
          <Card className="h-full hover:shadow-lg transition-all hover:border-blue-500 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-blue-700">
                <ShoppingCart className="h-6 w-6" />
                Bác Sĩ (POS)
              </CardTitle>
              <CardDescription>Kê đơn, tính tiền</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500">Truy cập giao diện bán hàng và thanh toán.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 2: Dược sĩ */}
        <Link href="/inventory" className="group">
          <Card className="h-full hover:shadow-lg transition-all hover:border-emerald-500 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-emerald-700">
                <Pill className="h-6 w-6" />
                Dược Sĩ (Kho)
              </CardTitle>
              <CardDescription>Quản lý kho thuốc</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500">Nhập hàng, sửa giá và xem tồn kho.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 3: Lịch sử (MỚI THÊM) */}
        <Link href="/history" className="group">
          <Card className="h-full hover:shadow-lg transition-all hover:border-purple-500 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-purple-700">
                <History className="h-6 w-6" />
                Lịch sử
              </CardTitle>
              <CardDescription>Xem lại giao dịch</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500">Tra cứu các đơn thuốc đã bán và tổng doanh thu.</p>
            </CardContent>
          </Card>
        </Link>

      </div>

      <div className="mt-12 text-sm text-slate-400">
        Phiên bản 1.1.0 - Senior AI Data Engineer
      </div>
    </main>
  );
}
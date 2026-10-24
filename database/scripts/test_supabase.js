// ==============================================================================
// HANOI FLOODWATCH GIS - TEST KẾT NỐI SUPABASE CLOUD (ZERO-DEPENDENCY)
// Sử dụng Fetch API & --env-file có sẵn trong Node.js 24
// Chạy lệnh: node --env-file=.env database/scripts/test_supabase.js
// ==============================================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log("---------------------------------------------------------------");
console.log("🚀 ĐANG KIỂM TRA KẾT NỐI TỚI SUPABASE CLOUD (HANOI FLOODWATCH)...");
console.log("---------------------------------------------------------------");

if (!supabaseUrl || supabaseUrl.includes("[YOUR-PROJECT-REF]") || !supabaseAnonKey || supabaseAnonKey.includes("[YOUR-ANON-KEY]")) {
  console.error("❌ LỖI: Chưa cấu hình SUPABASE_URL hoặc SUPABASE_ANON_KEY trong file .env!");
  console.log("👉 Vui lòng mở file .env và điền thông tin lấy từ Supabase: Project Settings -> API");
  process.exit(1);
}

async function verifySupabase() {
  try {
    const endpoint = `${supabaseUrl}/rest/v1/flood_points?select=id,name,address,risk_level,risk_score,is_demo&limit=5`;
    
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();

    console.log("✅ KẾT NỐI THÀNH CÔNG ĐẾN SUPABASE DATABASE!");
    console.log(`📊 Số lượng bản ghi truy vấn thử nghiệm: ${data.length}`);
    console.log("\n📋 DANH SÁCH 5 ĐIỂM NGẬP ĐẦU TIÊN TRONG CSDL:");
    console.table(data.map(p => ({
      "Tên điểm": p.name,
      "Địa chỉ": p.address,
      "Mức nguy cơ": p.risk_level,
      "Điểm số": p.risk_score,
      "Mô phỏng": p.is_demo ? "DEMO" : "Thực tế"
    })));

    console.log("\n🎉 Giai đoạn 2 đã sẵn sàng nghiệm thu!");
  } catch (err) {
    console.error("❌ Kết nối thất bại:", err.message);
    console.log("\n💡 Gợi ý kiểm tra:");
    console.log("1. Kiểm tra lại SUPABASE_URL và SUPABASE_ANON_KEY trong file .env.");
    console.log("2. Kiểm tra xem bạn đã chạy script 01_seed_flood_points.sql trong SQL Editor chưa.");
    console.log("3. Kiểm tra kết nối mạng Internet.");
  }
}

verifySupabase();

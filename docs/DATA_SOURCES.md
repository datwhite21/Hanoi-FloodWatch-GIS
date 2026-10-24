# DANH MỤC NGUỒN DỮ LIỆU & TỌA ĐỘ ĐIỂM NGẬP THỰC TẾ HÀ NỘI
## DỰ ÁN: HANOI FLOODWATCH GIS

---

## 1. NGUỒN DỮ LIỆU THU THẬP & TÍNH PHÁP LÝ

Để đảm bảo tính khoa học và giá trị thực tiễn cho đồ án, hệ thống **Hanoi FloodWatch GIS** thu thập và tham chiếu số liệu từ các cơ quan chức năng công khai của thành phố Hà Nội:

1. **Công ty TNHH MTV Thoát nước Hà Nội (HSDC):**
   - Tài liệu: *Kế hoạch đảm bảo thoát nước, chống úng ngập mùa mưa bão trên địa bàn thành phố Hà Nội*.
   - Dữ liệu thu nhận: Danh mục 30+ điểm đen ngập úng định kỳ khi lượng mưa vượt ngưỡng 50 - 100mm/2h.
   - Website chính thức: `http://thoatnuochanoi.vn`
2. **Cổng Thông tin Điện tử UBND Thành phố Hà Nội:**
   - Các bản tin thông báo phân luồng giao thông và cảnh báo điểm ngập trong các trận bão lớn (như bão Yagi số 3 năm 2024).
   - Website: `https://hanoi.gov.vn`
3. **OpenStreetMap Contributors:**
   - Dữ liệu bản đồ nền giao thông, ranh giới hành chính và các lớp thủy văn (sông Tô Lịch, sông Nhuệ, sông Đáy, hệ thống hồ điều hòa).
4. **Kiểm chứng Tọa độ Không gian:**
   - Tọa độ địa lý của tất cả điểm ngập được đối soát trực tiếp qua ảnh vệ tinh Google Maps / OpenStreetMap và chuẩn hóa về hệ quy chiếu **WGS 84 (EPSG:4326)** với định dạng `Point(Kinh độ [Longitude], Vĩ độ [Latitude])`.

---

## 2. BẢNG TỌA ĐỘ VÀ ĐẶC TÍNH 27 ĐIỂM NGẬP TRỌNG ĐIỂM TẠI HÀ NỘI

*(Ghi chú: Toàn bộ danh mục dưới đây là số liệu ghi nhận thực tế từ các báo cáo thoát nước đô thị Hà Nội)*

| STT | Tên điểm ngập úng | Quận/Huyện | Vĩ độ (Lat) | Kinh độ (Lng) | Mức độ nguy cơ | Độ sâu ghi nhận (cm) | Nguyên nhân & Đặc điểm địa hình | Nguồn kiểm chứng |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **1** | Phố Hoa Bằng (Yên Hòa) | Cầu Giấy | 21.0268 | 105.7942 | **HIGH** | 35 – 50 | Vùng trũng cục bộ ven sông Tô Lịch, cốt nền thấp, cống nhỏ | HSDC 2024 |
| **2** | Phố Phan Văn Trường | Cầu Giấy | 21.0392 | 105.7865 | **HIGH** | 30 – 45 | Khu chợ Nhà Xanh, đường hẹp, rác thải làm tắc hố ga | HSDC 2024 |
| **3** | Ngã tư Dương Đình Nghệ - Nam Trung Yên | Cầu Giấy | 21.0185 | 105.7880 | **HIGH** | 30 – 50 | Đoạn trũng trước Keangnam, phụ thuộc trạm bơm Yên Sở | HSDC & Báo Giao thông |
| **4** | Phố Trần Bình (BV 19-8) | Cầu Giấy | 21.0345 | 105.7765 | **MEDIUM** | 20 – 40 | Trũng cục bộ từ viện 19-8 đến UBND phường Mai Dịch | HSDC 2024 |
| **5** | Trục đường Cầu Giấy (Bưu điện Cầu Giấy) | Cầu Giấy | 21.0335 | 105.8005 | **LOW** | 15 – 25 | Nước dồn về nhanh nhưng rút sau 30-45 phút | HSDC 2024 |
| **6** | Đường Nguyễn Trãi (Cổng ĐH KHTN) | Thanh Xuân | 20.9965 | 105.8115 | **HIGH** | 35 – 55 | Trục huyết mạch, trũng chân cầu vượt cạn, nước dồn lớn | HSDC & TTXVN |
| **7** | Phố Bùi Xương Trạch | Thanh Xuân | 20.9882 | 105.8198 | **HIGH** | 40 – 60 | Địa hình trũng trũng nhất quận, khi sông Lừ dâng sẽ ngập tràn | HSDC 2024 |
| **8** | Phố Vương Thừa Vũ | Thanh Xuân | 20.9995 | 105.8232 | **MEDIUM** | 20 – 35 | Đường hẹp, cốt nền thấp hơn đường Trường Chinh | HSDC 2024 |
| **9** | Đường Nguyễn Tuân (giao Nguyễn Huy Tưởng) | Thanh Xuân | 21.0022 | 105.8035 | **MEDIUM** | 25 – 40 | Mật độ chung cư dày đặc, hệ thống thoát nước cũ quá tải | HSDC 2024 |
| **10** | Phố Quan Nhân | Thanh Xuân | 21.0075 | 105.8110 | **MEDIUM** | 20 – 35 | Khu dân cư ngõ hẻm trũng, tiêu thoát ra sông Tô Lịch chậm | HSDC 2024 |
| **11** | Ngã tư Lê Văn Lương - Hoàng Đạo Thúy | Thanh Xuân | 21.0065 | 105.8015 | **LOW** | 15 – 30 | Ngập mép đường khi mưa cường độ trên 70mm/h | HSDC 2024 |
| **12** | Đường Quang Trung (Ga La Khê) | Hà Đông | 20.9635 | 105.7680 | **HIGH** | 30 – 50 | Nút thắt trước Bưu điện Hà Đông, phụ thuộc trạm Yên Nghĩa | HSDC 2024 |
| **13** | Ngã ba Ba La (Phú Lãm) | Hà Đông | 20.9525 | 105.7585 | **HIGH** | 35 – 55 | Vùng trũng cửa ngõ QL6, hạ tầng thoát nước chưa đồng bộ | HSDC 2024 |
| **14** | KĐT Geleximco (Đường Lê Trọng Tấn) | Hà Đông | 20.9855 | 105.7420 | **HIGH** | 45 – 70 | Các hầm chui dân sinh ngập sâu tạo thành "túi nước" | Báo Tuổi Trẻ & HSDC |
| **15** | Phố Tô Hiệu (Hà Đông) | Hà Đông | 20.9702 | 105.7785 | **MEDIUM** | 20 – 40 | Đoạn giao cắt Bà Triệu và chợ Hà Đông | HSDC 2024 |
| **16** | Đường Phùng Hưng (Cổng BV K Tân Triều) | Hà Đông | 20.9680 | 105.7925 | **MEDIUM** | 25 – 45 | Trũng cục bộ phía trước cổng viện và khu tập thể | HSDC 2024 |
| **17** | Phố Yên Nghĩa (Bến xe Yên Nghĩa) | Hà Đông | 20.9500 | 105.7485 | **LOW** | 15 – 30 | Nước ngập mặt đường trước bến xe khoảng 40 phút | HSDC 2024 |
| **18** | Phố Thái Hà (Rạp Chiếu phim QG) | Đống Đa | 21.0145 | 105.8210 | **HIGH** | 25 – 45 | Trục giao thông chính, nước dồn về từ các tuyến lân cận | HSDC 2024 |
| **19** | Phố Nguyễn Khuyến (Cổng trường Lý Thường Kiệt) | Đống Đa | 21.0255 | 105.8385 | **HIGH** | 35 – 55 | Điểm trũng lâu năm nhất nội đô, thấp hơn xung quanh gần 1m | HSDC 2024 |
| **20** | Ngã tư Huỳnh Thúc Kháng - Nguyên Hồng | Đống Đa | 21.0205 | 105.8120 | **MEDIUM** | 20 – 35 | Quá tải khi mưa tập trung thời gian ngắn | HSDC 2024 |
| **21** | Hầm chui Đại lộ Thăng Long (Số 3, 5, 6) | Nam Từ Liêm | 20.9990 | 105.7480 | **HIGH** | 50 – 80 | Trũng đáy hầm giao thông, cô lập tuyến gom cao tốc | HSDC 2024 |
| **22** | Đường Đỗ Đức Dục (Cổng TT Hội nghị QG) | Nam Từ Liêm | 21.0080 | 105.7875 | **MEDIUM** | 20 – 35 | Đoạn giao với đường Miếu Đầm | HSDC 2024 |
| **23** | Đường Phạm Văn Đồng (Chân cầu Mai Dịch) | Bắc Từ Liêm | 21.0415 | 105.7780 | **MEDIUM** | 25 – 40 | Đoạn trước cổng Trường ĐH Ngoại ngữ | HSDC 2024 |
| **24** | Phố Định Công (Đoạn rẽ từ Giải Phóng) | Hoàng Mai | 20.9820 | 105.8410 | **HIGH** | 35 – 50 | Tuyến đường hẹp cạnh đường sắt, trũng nước tiêu chậm | HSDC 2024 |
| **25** | Đường Tân Mai (Đối diện hồ Đền Lừ) | Hoàng Mai | 20.9860 | 105.8540 | **MEDIUM** | 25 – 40 | Nước dồn tràn từ mặt đường ra mép bờ kè hồ | HSDC 2024 |
| **26** | Phố Minh Khai (Chân cầu Vĩnh Tuy) | Hai Bà Trưng | 20.9985 | 105.8670 | **MEDIUM** | 20 – 40 | Đoạn chân dốc cầu vượt và ngã ba rẽ Tam Trinh | HSDC 2024 |
| **27** | Phố Thụy Khuê (Dốc La Pho) | Tây Hồ | 21.0425 | 105.8270 | **MEDIUM** | 25 – 40 | Điểm trũng chân dốc từ đường Hoàng Hoa Thám xuống | HSDC 2024 |

---

## 3. CÁC KỊCH BẢN DỮ LIỆU MÔ PHỎNG PHỤC VỤ KIỂM THỬ (DEMO SCENARIOS)
Nhằm mục đích thử nghiệm tính năng cảnh báo và truy vấn thời gian thực của đồ án khi trời không mưa ngoài thực tế, hệ thống chuẩn bị thêm **3 kịch bản ngập mô phỏng** có gắn cờ `is_demo = true`:

1. **[DEMO] Bão số 3 (Cực đoan - Mưa > 150mm/3h):**
   - Kích hoạt cảnh báo ĐỎ (RED) diện rộng tại Cầu Giấy (Hoa Bằng, Phan Văn Trường) và Nam Từ Liêm (Hầm chui Thăng Long).
2. **[DEMO] Mưa rào đầu mùa (Trung bình - Mưa 60-80mm/1h):**
   - Kích hoạt cảnh báo CAM (ORANGE) cục bộ tại Nguyễn Trãi, Thái Hà.
3. **[DEMO] Triều cường / Nước sông Tô Lịch dâng cao:**
   - Kích hoạt cảnh báo VÀNG (YELLOW) tại Bùi Xương Trạch và Định Công.

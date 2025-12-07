# TÀI LIỆU YÊU CẦU NGHIỆP VỤ: HỆ THỐNG THEO DÕI ĐƠN HÀNG & BÁO CÁO

## I. TỔNG QUAN DỰ ÁN

  * **Mục tiêu:** Xây dựng giải pháp nhập liệu và theo dõi đơn hàng tập trung, giúp quản lý doanh số sales, phân loại khách hàng và báo cáo doanh thu theo thời gian thực.
  * **Nền tảng triển khai:**
      * **Mobile App:** Dành cho Sales nhập liệu, nhận thông báo và xem báo cáo nhanh.
      * **Web Portal:** Dành cho Quản lý xem báo cáo chi tiết, xuất Excel và quản trị hệ thống.

-----

## II. PHÂN QUYỀN & CƠ CẤU TỔ CHỨC (USER ROLES)

Hệ thống cần đáp ứng mô hình quản lý 3 cấp độ (Level) với nguyên tắc bảo mật dữ liệu chặt chẽ:

1.  **Cấp Nhân viên (Sales):**
      * Chỉ xem được danh sách đơn hàng và doanh số của chính mình.
      * Chịu trách nhiệm nhập liệu đơn hàng.
2.  **Cấp Quản lý Đơn vị (Unit Manager):**
      * Quản lý 1 đơn vị cụ thể.
      * Xem được tổng doanh số của đơn vị mình và chi tiết của các sales thuộc đơn vị đó.
3.  **Cấp Quản lý Cấp cao (General Manager/Multi-unit Manager):**
      * Quản lý 2 đơn vị trở lên (hoặc toàn bộ).
      * Xem được báo cáo tổng hợp của các đơn vị được phân công.

-----

## III. TÍNH NĂNG CHI TIẾT (FEATURE LIST)

### 1\. Phân hệ Nhập liệu & Quản lý Đơn hàng

Đây là chức năng cốt lõi trên Mobile App dành cho Sales.

  * **Thông tin đơn hàng:** Nhập chi tiết các trường thông tin (Sản phẩm, Số lượng, Giá trị...).
  * **Thông tin khách hàng:**
      * **Số điện thoại (Bắt buộc):** Là Key chính để định danh khách hàng.
      * **Trường hợp ngoại lệ:** Nếu khách không có SĐT, nhập giá trị "Không có số".
  * **Logic tự động phát hiện (Validation Logic):**
      * Hệ thống tự động kiểm tra SĐT vừa nhập so với dữ liệu lịch sử.
      * Nếu SĐT trùng khớp $\rightarrow$ Hệ thống tự động điền (Auto-fill) thông tin nguồn khách hàng dựa trên dữ liệu gốc (Sales không được phép chỉnh sửa trường Nguồn để tránh sai lệch).
      * Nếu SĐT mới $\rightarrow$ Cho phép Sales chọn Nguồn khách hàng thủ công.

### 2\. Logic Phân loại Khách hàng (Cũ/Mới) & Nguồn

Đây là phần logic nghiệp vụ quan trọng nhất để phục vụ báo cáo chính xác.

#### A. Định nghĩa Khách hàng cũ (Returning Customer)

Hệ thống xác định khách hàng cũ dựa trên 2 kịch bản:

  * **Kịch bản 1: Có Số điện thoại (Ưu tiên cao nhất)**

      * Khách hàng có SĐT trùng với SĐT đã tồn tại trong hệ thống.
      * **Điều kiện:** Thời điểm tạo đơn hiện tại \> Thời điểm tạo đơn lần đầu.
      * **Hành động:** Hệ thống tự động đánh dấu là Khách cũ (Mua lại).

  * **Kịch bản 2: Không có Số điện thoại**

      * Sales nhập SĐT là "Không có số".
      * **Hành động:** Hệ thống dựa vào trường **Nguồn khách hàng** do Sales chọn. Nếu Sales chọn nguồn thuộc nhóm "Khách mua lại" $\rightarrow$ Tính là Khách cũ.
      * *Lưu ý:* Trường hợp này chỉ tính vào báo cáo Doanh thu/Số lượng đơn mua lại. Không tính đếm số lượng đầu mục khách hàng (Unique Customer Count) do không định danh được.

#### B. Các Enum (Danh mục từ điển)

Dưới đây là các giá trị cố định (Master Data) cần thiết lập trong hệ thống:

| Tên Enum               | Giá trị (Values)                                                                                                                                                                                                  | Ghi chú Logic                                                                                                                  |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **Loại khách mua lại** | 1. Khách mua lại qua Quảng cáo<br>2. Khách mua lại KHÔNG qua Quảng cáo                                                                                                                                            | Dùng để phân tích hiệu quả Marketing (Retargeting)                                                                             |
| **Nguồn khách hàng**   | 1. Hotline / Tổng đài<br>2. Facebook Ads (Quảng cáo)<br>3. Zalo OA<br>4. Khách tại cửa hàng (Walk-in)<br>5. Khách giới thiệu (Referral)<br>6. Khách mua lại qua Quảng cáo<br>7. Khách mua lại không qua Quảng cáo | - Nếu SĐT trùng: Hệ thống tự lock nguồn.<br>- Nếu "Không có số": Sales chọn 1 trong 2 mục cuối (6 hoặc 7) để tính là khách cũ. |

### 3\. Phân hệ Thông báo (Notification)

Mục tiêu: Giúp quản lý nắm bắt tình hình kinh doanh tức thời (Real-time).

  * **Cơ chế:**
      * Gửi thông báo ngay lập tức khi Sales nhập đơn thành công.
      * **Người nhận:** Các cấp quản lý liên quan (Quản lý đơn vị & Quản lý cấp cao).
  * **Hình thức hiển thị:**
      * **Mobile App Push:** Hiển thị thông báo dạng **Full Screen (Toàn màn hình)** hoặc Popup nổi bật để quản lý không bị trôi tin.
      * **Zalo Message:** Gửi tin nhắn về Zalo (Lưu ý: Đánh dấu là *Giai đoạn 2* nếu chi phí tích hợp Zalo OA cao, ưu tiên App Notification trước).

### 4\. Phân hệ Báo cáo & Dashboard (Reporting)

Hệ thống cần cung cấp các biểu đồ trực quan và khả năng xuất dữ liệu thô.

  * **Bộ lọc (Filter):** Từ ngày - Đến ngày.
  * **Các loại báo cáo:**
    1.  **Báo cáo Doanh thu:**
          * Theo Nguồn khách hàng.
          * Theo Thời điểm (Ngày/Tuần/Tháng).
          * Theo Dòng sản phẩm & Sản phẩm bán chạy (Best-seller).
    2.  **Báo cáo Khách hàng cũ (Retention):**
          * Tỷ lệ khách mua lại.
          * Doanh thu từ khách cũ vs khách mới.
    3.  **Báo cáo So sánh Cùng kỳ (YoY/MoM):**
          * So sánh doanh thu giai đoạn hiện tại với cùng kỳ trước đó để đánh giá tăng trưởng.
  * **Tính năng bổ trợ:**
      * Xuất dữ liệu ra Excel (Export Excel) để kế toán/admin xử lý thêm.

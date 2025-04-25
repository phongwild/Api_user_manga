# API User Manga

API quản lý người dùng, bình luận, lịch sử đọc và theo dõi manga.

## Các Route API

### 1. **User Routes**

#### `GET /users`

Lấy danh sách tất cả người dùng.

#### `POST /users/login`

Đăng nhập người dùng.

#### `POST /users/register`

Đăng ký người dùng mới.

#### `PUT /users/update-profile/:id`

Cập nhật thông tin người dùng.

#### `GET /users/logout`

Đăng xuất người dùng.

#### `POST /users/forgotpassword`

Gửi yêu cầu lấy lại mật khẩu qua email.

#### `POST /users/resetpassword/:id/:token`

Đặt lại mật khẩu sau khi người dùng nhận mã OTP.

#### `GET /users/profile`

Lấy thông tin hồ sơ người dùng đã đăng nhập (yêu cầu đăng nhập).

#### `POST /users/verify-otp`

Xác thực mã OTP.

#### `GET /users/getuserbyid`

Lấy thông tin người dùng theo ID.

---

### 2. **Comment Routes**

#### `GET /comments/:mangaId`

Lấy danh sách bình luận của manga theo `mangaId`.

#### `POST /comments/post/:mangaId`

Thêm bình luận mới cho manga theo `mangaId`.

#### `PUT /comments/edit/:mangaId/:commentId`

Chỉnh sửa bình luận của manga theo `mangaId` và `commentId`.

#### `DELETE /comments/delete/:mangaId/:commentId`

Xóa bình luận của manga theo `mangaId` và `commentId`.

#### `POST /comments/reply/:mangaId/:commentId`

Trả lời bình luận của manga theo `mangaId` và `commentId`.

#### `PUT /comments/reply/:mangaId/:commentId/:replyId`

Chỉnh sửa phản hồi bình luận của manga theo `mangaId`, `commentId`, và `replyId`.

#### `DELETE /comments/reply/:mangaId/:commentId/:replyId`

Xóa phản hồi bình luận của manga theo `mangaId`, `commentId`, và `replyId`.

---

### 3. **Follow Routes**

#### `GET /follow/:uid`

Lấy danh sách manga mà người dùng `uid` đang theo dõi.

#### `POST /follow/add/:uid`

Thêm manga vào danh sách theo dõi của người dùng `uid`.

#### `POST /follow/remove/:uid`

Xóa manga khỏi danh sách theo dõi của người dùng `uid`.

---

### 4. **History Routes**

#### `POST /history/add/:uid`

Thêm lịch sử đọc manga cho người dùng `uid`.

#### `GET /history/:uid`

Lấy danh sách lịch sử đọc manga của người dùng `uid`.

#### `DELETE /history/clear/:uid`

Xóa lịch sử đọc manga của người dùng `uid`.

---

## Các Thư Viện và Công Cụ Sử Dụng

- **Express.js**: Framework cho Node.js để xây dựng API.
- **CatchAsync**: Giúp xử lý các lỗi bất đồng bộ.
- **Middleware**: Kiểm tra người dùng đã đăng nhập hay chưa (isLoggedIn).

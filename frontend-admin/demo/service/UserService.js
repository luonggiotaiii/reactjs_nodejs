const API_BASE_URL = 'http://localhost:3001'; // Thay bằng URL API thực tế

export class UserService {
    async getUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/userss`);
            if (!response.ok) throw new Error('Không thể lấy danh sách người dùng');
            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy danh sách:', error);
            throw error;
        }
    }
}
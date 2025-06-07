import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // Thay bằng URL API thực tế của bạn

export class OrderService {
    // Lấy danh sách đơn hàng đang chờ xử lý
    async getPendingOrders() {
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/pending`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng đang chờ xử lý:', error);
            return [];
        }
    }

    // Lấy danh sách đơn hàng không chờ xử lý
    async getNonPendingOrders() {
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/non-pending`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng không chờ xử lý:', error);
            return [];
        }
    }
    async getProductById(productId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin sản phẩm:', error);
            return null;
        }
    }
    async getOrderDetails(orderId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/order-details/order/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            return [];
        }
    }
    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        try {
            const response = await axios.put(`${API_BASE_URL}/orders/status/${orderId}`, { status });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            throw error;
        }
    }
}
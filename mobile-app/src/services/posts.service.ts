import axios, { AxiosInstance } from 'axios';
import { auth } from '../config/firebase';
import { Comment, Post } from '../types';

const BASE_URL = 'http://10.100.102.16:3000/api'; // ה-IP שלך

class PostsServiceClass {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
    });
  }

  private async getAuthHeaders(isMultipart = false) {
    const user = auth.currentUser;
    const headers: Record<string, string> = {};

    if (isMultipart) {
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getAllPosts(): Promise<Post[]> {
    const headers = await this.getAuthHeaders();
    const { data } = await this.api.get<Post[]>('/posts', { headers });
    return data;
  }

  async createPost(formData: FormData): Promise<Post> {
    const headers = await this.getAuthHeaders(true);
    const { data } = await this.api.post<Post>('/posts', formData, { headers });
    return data;
  }

  async addComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const headers = await this.getAuthHeaders();
    // בשרת אנחנו מצפים ל-content, אז נמפה את הטקסט לשדה הנכון
    const payload = parentId ? { content, parentCommentId: parentId } : { content };
    const { data } = await this.api.post<Comment>(`/posts/${postId}/comments`, payload, { headers });
    return data;
  }

  // תיקון 4: הוספת הפונקציה החסרה ללייקים
  async togglePostLike(postId: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    // אין צורך ב-body, רק ב-URL
    const { data } = await this.api.post(`/posts/${postId}/like`, {}, { headers });
    return data;
  }
}

export const PostsService = new PostsServiceClass();
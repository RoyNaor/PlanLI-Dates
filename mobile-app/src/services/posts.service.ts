import axios, { AxiosInstance } from 'axios';
import { auth } from '../config/firebase';

const BASE_URL = 'http://10.100.102.16:3000/api'; // ה-IP שלך

export interface Comment {
  _id: string;
  text: string; // שים לב: ב-DTO זה content, כאן זה text (תלוי איך המיפוי בשרת, נשאיר text כרגע)
  authorId?: {
    _id: string;
    displayName: string;
    photoUrl?: string;
  };
  createdAt?: string;
  parentId?: string | null;
  replies?: Comment[];
}

// עדכון ה-Interface כדי שיתאים למה שה-ChatScreen מחפש
export interface Post {
  _id: string;
  text: string;
  
  // תיקון 1: שינוי מ-authorName לאובייקט מלא
  authorId?: {
    _id: string;
    displayName: string;
    photoUrl?: string;
  };
  
  createdAt?: string;
  imageUrl?: string | null;
  
  // תיקון 2: תמיכה גם בטקסט וגם באובייקט מיקום
  location?: string | { name: string; lat: number; long: number };
  
  comments?: Comment[];
  
  // תיקון 3: הוספת מערך הלייקים (כדי שנדע אם הלב אדום)
  likes?: string[]; 
  likesCount?: number;
}

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

  async addComment(postId: string, text: string, parentId?: string): Promise<Comment> {
    const headers = await this.getAuthHeaders();
    // בשרת אנחנו מצפים ל-content, אז נמפה את text ל-content
    const payload = parentId ? { content: text, parentId } : { content: text };
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
import axios, { AxiosInstance } from 'axios';
import { auth } from '../config/firebase';

const BASE_URL = 'http://172.20.10.2:3000/api';

export interface Comment {
  _id: string;
  text: string;
  authorName?: string;
  createdAt?: string;
  parentId?: string | null;
  replies?: Comment[];
}

export interface Post {
  _id: string;
  text: string;
  authorName?: string;
  createdAt?: string;
  imageUrl?: string | null;
  location?: string;
  comments?: Comment[];
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
    const payload = parentId ? { text, parentId } : { text };
    const { data } = await this.api.post<Comment>(`/posts/${postId}/comments`, payload, { headers });
    return data;
  }
}

export const PostsService = new PostsServiceClass();

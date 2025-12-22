export interface UserSummary {
  _id: string;
  displayName: string;
  photoUrl?: string;
}

export interface Location {
  name: string;
  lat: number;
  long: number;
}

export interface Comment {
  _id: string;
  content: string;
  authorId?: UserSummary | string;
  createdAt?: string;
  parentComment?: string;
  replies?: Comment[];
  likes?: string[];
  depth?: number;
}

export interface Post {
  _id: string;
  content: string;
  authorId?: UserSummary | string;
  createdAt?: string;
  imageUrl?: string | null;
  location?: Location;
  comments?: Comment[];
  likes?: string[];
  likesCount?: number;
}

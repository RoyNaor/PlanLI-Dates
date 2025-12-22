export interface LocationDTO {
  name: string;
  lat: number;
  long: number;
}

export interface CreatePostDTO {
  content: string;
  imageUrl?: string;
  location?: LocationDTO;
}

export interface CreateCommentDTO {
  content: string;
  postId?: string;
  parentCommentId?: string;
}

// 타입 정의
export type Bindings = {
  DB: D1Database;
}

export type Variables = {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

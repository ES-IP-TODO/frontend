export interface UserResponse {
    givenName: string;
    email: string;
    familyName: string;
    username: string;
    id: string;
    isActive: boolean;
    updatedAt: string;
}

export interface TaskPost {
    name: string;
    description: string;
    deadline: string;
    priority: string;
}

export interface TaskUpdate {
    name?: string;
    description?: string;
    deadline?: string;
    priority?: string;
    status?: "todo" | "in-progress" | "done";
}
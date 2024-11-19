import config from "@/config";
import { TaskPost, TaskUpdate } from "@/lib/types";
import { createClient } from "./client";

const client = createClient(config.API_URL);

const TaskService = {
    async createTask(task: TaskPost) {
        return client.post("/tasks", task);
    },
    async getTasks() {
        return client.get("/tasks");
    },
    async getTask(id: string) {
        return client.get(`/tasks/${id}`);
    },
    async getTaskByStatus(status: string) {
        return client.get(`/tasks/status/${status}`);
    },
    async updateTask(id: string, task: TaskUpdate) {
        console.log(task);
        return client.put(`/tasks/${id}`, task);
    },
    async deleteTask(id: string) {
        return client.delete(`/tasks/${id}`);
    },
};

export { TaskService };

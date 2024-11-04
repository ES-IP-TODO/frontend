import config from "@/config";
import { TaskPost, TaskUpdate } from "@/lib/types";
import { createClient } from "./client";

const client = createClient(config.API_TASK_URL);

const TaskService = {
    async createTask(task: TaskPost) {
        return client.post("/", task);
    },
    async getTasks() {
        return client.get("/");
    },
    async getTask(id: string) {
        return client.get(`/${id}`);
    },
    async getTaskByStatus(status: string) {
        return client.get(`/status/${status}`);
    },
    async updateTask(id: string, task: TaskUpdate) {
        console.log(task);
        return client.put(`/${id}`, task);
    },
    async deleteTask(id: string) {
        return client.delete(`/${id}`);
    },
};

export { TaskService };

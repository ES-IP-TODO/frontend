import config from "@/config";
import { createClient } from "./client";

const client = createClient(config.API_URL);

const UserService = {
    async login(code: string) {
        return client.post("/auth/sign-in?code=" + code);
    },
    async logout() {
        return client.get("/auth/logout");
    },
    async getUser() {
        return client.get("/auth/me");
    },
};

export { UserService };

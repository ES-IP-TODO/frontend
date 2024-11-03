import config from "@/config";
import { createClient } from "./client";

const client = createClient(config.API_USER_URL);

const UserService = {
    async login(code: string) {
        return client.post("/sign-in?code=" + code);
    },
    async logout() {
        return client.get("/logout");
    },
    async getUser() {
        return client.get("/me");
    },
};

export { UserService };

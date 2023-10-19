import axios from "axios";
import { logoutUser } from "../redux/slices/auth";
import { store } from "../index";
const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export interface IResult {
    message: string;
}
export interface ICall {
    status: "success" | "failed" | "idle" | "loading";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
    result: IResult | null;
}
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response.data.message === "The session ended. Please reconnect") {
            void store.dispatch(logoutUser());
        }
        return Promise.reject(err);
    },
);

export default api;

import { io, Socket } from "socket.io-client";
import { apiUrl } from "@/lib/dotenv";

export const socket: Socket = io(apiUrl, {
	withCredentials: true,
});

import { io } from "socket.io-client";
import { DOMAIN } from "../apis/axiosClient";

const URL = DOMAIN || "http://localhost:3001";

export const socket = io(URL);

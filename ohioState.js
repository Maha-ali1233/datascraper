import io from "socket.io-client";
import fs from "graceful-fs";

const socket = io("https://search-api-dev.intcomm.osu.edu", {
  path: "/socket.io",
  transports: ["websocket", "polling"], // Allow it to fall back to polling if needed
});

socket.on("connect", () => {
  console.log("Connected to the server");

  // Emit the search event
  socket.emit("search", {
    term: "Jon",
    providers: ["people"],
  });
});

socket.on("results", (data) => {
  fs.writeFileSync("test.json", JSON.stringify(data, null, 2));
  const dataWeWant = data?.data?.map((person) => {
    return {
      id: person?.id,
      name: person?.attributes?.title,
      email: person?.attributes?.email,
    };
  });
  console.log("dataWeWant", dataWeWant);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected from the server:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

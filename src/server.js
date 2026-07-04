import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`ShopEase Support Service listening on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  console.error(err);

  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
  }

  process.exit(1);
});
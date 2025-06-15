import cors from "cors";

export const corsWithConfig = () => {
  if (!process.env.ENABLE_CORS) {
    // allow localhost origin in dev environment
    return cors({
      origin: ["http://localhost:5173"],
    });
  } else {
    return cors();
  }
};

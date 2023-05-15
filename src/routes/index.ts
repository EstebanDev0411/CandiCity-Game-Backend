import authRoute from "./auth.route";
import userRoute from "./user.route";

export default function setupRoute(app: any) {
  app.use("/auth", authRoute);
  app.use("/user", userRoute);
}

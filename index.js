import express from "express";
import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import cors from "cors";
import PathParameters from "./Lab5/PathParameters.js";
import QueryParameters from "./Lab5/QueryParameters.js";
import WorkingWithObjects from "./Lab5/WorkingWithObjects.js";
import ModuleRoute from "./Lab5/ModuleRoute.js";
import WorkingWithArrays from "./Lab5/WorkingWithArrays.js";
import db from "./kambaz/database/index.js";
import UserRoutes from "./kambaz/users/routes.js";
import "dotenv/config";
import session from "express-session";
import CourseRoutes from "./kambaz/courses/routes.js";
import AssignmentRoutes from "./kambaz/assignments/routes.js";
import ModulesRoutes from "./kambaz/modules/routes.js";
import PazzaRoutes from "./kambaz/pazza/routes.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  }),
);

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.SERVER_URL,
  };
}

app.use(session(sessionOptions));

app.use(express.json());
UserRoutes(app, db);
CourseRoutes(app, db);
AssignmentRoutes(app, db);
ModulesRoutes(app, db);
PazzaRoutes(app, db);
Lab5(app);
Hello(app);
PathParameters(app);
QueryParameters(app);
WorkingWithObjects(app);
ModuleRoute(app);
WorkingWithArrays(app);
app.listen(process.env.PORT || 4000);

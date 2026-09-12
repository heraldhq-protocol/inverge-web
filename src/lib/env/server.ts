import "server-only";

import { parseEnvironment } from "@/lib/env/schema";

export const serverEnvironment = parseEnvironment(process.env);

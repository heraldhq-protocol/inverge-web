import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export function parseEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
) {
  return environmentSchema.parse(environment);
}

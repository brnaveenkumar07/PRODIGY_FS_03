import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo.user@ecom.local";
const DEMO_USER_NAME = "Demo User";
const DEMO_USER_PASSWORD = "demo-password-not-for-production";

export async function getOrCreateDemoUserId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
      password: DEMO_USER_PASSWORD,
    },
    select: { id: true },
  });

  return user.id;
}

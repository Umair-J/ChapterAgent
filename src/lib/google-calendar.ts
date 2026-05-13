import { google } from "googleapis";
import { prisma } from "./prisma";

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

export async function getCalendarClient(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { googleTokens: true },
  });

  if (!user.googleTokens) {
    throw new Error("No Google tokens found. Please re-authenticate.");
  }
  const tokens: GoogleTokens = JSON.parse(user.googleTokens);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });

  // Persist refreshed tokens automatically
  oauth2Client.on("tokens", async (newTokens) => {
    const updatedTokens: GoogleTokens = {
      ...tokens,
      access_token: newTokens.access_token || tokens.access_token,
      expiry_date: newTokens.expiry_date || tokens.expiry_date,
      ...(newTokens.refresh_token && {
        refresh_token: newTokens.refresh_token,
      }),
    };
    await prisma.user.update({
      where: { id: userId },
      data: { googleTokens: JSON.stringify(updatedTokens) },
    });
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

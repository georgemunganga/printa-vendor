export interface GoogleUserProfile {
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

interface GoogleUserInfoResponse {
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google account profile.");
  }

  const data = (await response.json()) as GoogleUserInfoResponse;
  if (!data.email || !data.name) {
    throw new Error("Google account response is missing required fields.");
  }

  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
    emailVerified: Boolean(data.email_verified),
  };
}

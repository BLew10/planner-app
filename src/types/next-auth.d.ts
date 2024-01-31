import "next-auth";

declare module "next-auth" {
  interface Session {
    id?: string;
    user?: {
      id?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    id?: string | null;
    passsword?: string | null;
  }
}
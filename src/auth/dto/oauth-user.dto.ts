export interface OAuthUser {
    provider: string;
    providerId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
}
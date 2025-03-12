export interface OAuthUser {
    provider: string;
    provider_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    picture?: string;
}
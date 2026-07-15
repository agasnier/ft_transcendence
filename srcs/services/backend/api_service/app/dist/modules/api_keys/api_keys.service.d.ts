export declare function getAllApiKeys(): Promise<{
    id: number;
    owner_id: number;
    api_key_hash: string;
    expires_at: Date;
}[]>;
export declare function getApiKeysByOwnerId(owner_id: number): Promise<{
    id: number;
    owner_id: number;
    api_key_hash: string;
    expires_at: Date;
}>;
export declare function createApiKeys(owner_id: number): Promise<{
    id: number;
    owner_id: number;
    apiKeyCreated: string;
}>;
export declare function updateApiKeys(owner_id: number): Promise<{
    owner_id: number;
    apiKeyCreated: string;
} | null>;
export declare function deleteApiKeys(owner_id: number): Promise<boolean>;
export declare function verifyApiKey(apiKey: string): Promise<{
    owner_id: number;
} | null>;

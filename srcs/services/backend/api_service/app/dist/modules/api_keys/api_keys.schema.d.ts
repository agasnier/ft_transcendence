export declare const listApiKeysSchema: {
    response: {
        200: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    owner_id: {
                        type: string;
                    };
                    api_key_hash: {
                        type: string;
                    };
                    created_at: {
                        type: string;
                    };
                };
            };
        };
    };
};
export declare const getApiKeysSchema: {
    params: {
        type: string;
        required: string[];
        properties: {
            owner_id: {
                type: string;
                minimum: number;
            };
        };
    };
    response: {
        200: {
            type: string;
            properties: {
                id: {
                    type: string;
                };
                owner_id: {
                    type: string;
                };
                api_key_hash: {
                    type: string;
                };
                created_at: {
                    type: string;
                };
            };
        };
    };
};
export declare const createApiKeysSchema: {
    body: {
        type: string;
        required: string[];
        additionalProperties: boolean;
        properties: {
            owner_id: {
                type: string;
                minimum: number;
            };
        };
    };
    response: {
        201: {
            type: string;
            properties: {
                id: {
                    type: string;
                };
                owner_id: {
                    type: string;
                };
                apiKeyCreated: {
                    type: string;
                };
            };
        };
    };
};
export declare const updateApiKeysSchema: {
    params: {
        type: string;
        required: string[];
        properties: {
            owner_id: {
                type: string;
                minimum: number;
            };
        };
    };
    response: {
        200: {
            type: string;
            properties: {
                id: {
                    type: string;
                };
                owner_id: {
                    type: string;
                };
                apiKeyCreated: {
                    type: string;
                };
            };
        };
    };
};
export declare const deleteApiKeysSchema: {
    params: {
        type: string;
        required: string[];
        properties: {
            owner_id: {
                type: string;
                minimum: number;
            };
        };
    };
};

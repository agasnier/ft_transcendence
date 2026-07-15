export declare const registerSchema: {
    body: {
        type: string;
        required: string[];
        additionalProperties: boolean;
        properties: {
            mail: {
                type: string;
                format: string;
                maxLength: number;
            };
            pseudo: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            password: {
                type: string;
                minLength: number;
                maxLength: number;
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
                pseudo: {
                    type: string;
                };
            };
        };
    };
};
export declare const loginSchema: {
    body: {
        type: string;
        required: string[];
        additionalProperties: boolean;
        properties: {
            login: {
                type: string;
                minLength: number;
                maxLength: number;
            };
            password: {
                type: string;
                minLength: number;
                maxLength: number;
            };
        };
    };
    response: {
        200: {
            type: string;
            properties: {
                message: {
                    type: string;
                };
            };
        };
    };
};

export declare const listUsersSchema: {
    response: {
        200: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    pseudo: {
                        type: string;
                    };
                    mail: {
                        type: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                    };
                };
            };
        };
    };
};
export declare const getUserSchema: {
    params: {
        type: string;
        required: string[];
        properties: {
            id: {
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
                pseudo: {
                    type: string;
                };
                mail: {
                    type: string;
                };
                role: {
                    type: string;
                    enum: string[];
                };
            };
        };
    };
};
export declare const createUserSchema: {
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
                mail: {
                    type: string;
                };
                role: {
                    type: string;
                    enum: string[];
                };
            };
        };
    };
};
export declare const updateUserSchema: {
    params: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
                minimum: number;
            };
        };
    };
    body: {
        type: string;
        additionalProperties: boolean;
        minProperties: number;
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
        200: {
            type: string;
            properties: {
                id: {
                    type: string;
                };
                pseudo: {
                    type: string;
                };
                mail: {
                    type: string;
                };
                role: {
                    type: string;
                    enum: string[];
                };
            };
        };
    };
};
export declare const deleteUserSchema: {
    params: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
                minimum: number;
            };
        };
    };
};

export {};

declare global {
    interface Window {
        ethereum: {
            providers: any;
            on: any;
        };
    }
}

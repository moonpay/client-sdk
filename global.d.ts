export {};

declare global {
    interface Window {
        ethereum: {
            providers: any;
            on: any; // TODO: add type here
            removeListener: any; // TODO: add type here
        };
    }
}

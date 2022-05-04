export class GenericHelpers {
    public static async sleep(seconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000 * seconds);
        });
    }
}

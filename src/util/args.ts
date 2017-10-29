
export const defaultFormatter = (arg) => {
    return arg;
};

export const formatArgs = async(formats, argv) => {
    const formatJobs = Object.keys(argv).map((key) => {
        const value = argv[key];
        const formatter = formats[key] || defaultFormatter;
        return formatter(value, argv);
    });
    const formatResults = await Promise.all(formatJobs);
    return Object.keys(argv).reduce((obj, key, index) => {
        const value = formatResults[index];
        return {
            ...obj,
            [key]: value,
        };
    }, {});
};

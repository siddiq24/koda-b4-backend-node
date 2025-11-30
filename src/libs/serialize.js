function serialize(obj) {
    try {
        return JSON.parse(JSON.stringify(
            obj,
            (_, v) => (typeof v === "bigint" ? v.toString() : v)
        ));
    } catch (err) {
        return obj?.toString ? obj.toString() : obj;
    }
}

export default serialize;

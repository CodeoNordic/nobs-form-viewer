export default function getRecordsFromObject<T = FM.Record>(
    obj: FM.Record<T>[]|FM.DataAPIRecord<T>[]|FM.DataAPIResponse<T>|null
): FM.Record<T>[]|null {
    // null
    if (obj === null) return null;

    // FM.DataAPIResponse
    if (!(obj instanceof Array)) return obj?.response?.data?.map?.(record => record?.fieldData) as FM.Record<T>[]|null;

    // FM.DataAPIRecord[]
    if (obj[0]?.fieldData !== undefined) return obj?.map?.(record => record?.fieldData) as FM.Record<T>[];

    // FM.Record[]
    return obj as FM.Record<T>[];
}
const ListsNames = {
    WHITELIST: "whiteListIDs",
    IGNORELIST: "ignoreListIDs"
} as const;

type ListsNamesType = (typeof ListsNames)[keyof typeof ListsNames];

export default ListsNames;
export type { ListsNamesType };

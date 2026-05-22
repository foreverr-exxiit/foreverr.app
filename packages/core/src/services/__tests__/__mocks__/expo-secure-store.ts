// Stub used by vitest config alias — real expo-secure-store loads
// native modules that don't exist in Node. Provide just enough surface
// for code that touches it at import time.
export const getItemAsync = async (_key: string) => null;
export const setItemAsync = async (_key: string, _value: string) => {};
export const deleteItemAsync = async (_key: string) => {};
export default { getItemAsync, setItemAsync, deleteItemAsync };

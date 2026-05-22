// Stub used by vitest config alias — real expo-modules-core requires
// the global `expo` runtime which only exists in the Expo client.
export class EventEmitter {
  addListener(_event: string, _listener: (...args: unknown[]) => void) {
    return { remove() {} };
  }
  removeAllListeners(_event: string) {}
  emit(_event: string, ..._args: unknown[]) {}
}
export const NativeModule = class {};
export const requireNativeModule = (_name: string) => ({});
export default { EventEmitter, NativeModule, requireNativeModule };

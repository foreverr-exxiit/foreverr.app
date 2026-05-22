import { useState, useCallback, useEffect } from "react";
import { Platform } from "react-native";

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

interface UseUserLocationReturn {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
}

/**
 * Cross-platform geolocation hook.
 * - Web: uses navigator.geolocation
 * - Native: uses expo-location (lazy require to avoid TS1323)
 * - Fallback: IP-based geolocation via ip-api.com
 *
 * Does NOT request permission automatically — call `requestLocation()` explicitly.
 */
export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── IP-based fallback ─────────────────────────────────────────────
  const getLocationByIP = useCallback(async (): Promise<UserLocation | null> => {
    try {
      const res = await fetch("http://ip-api.com/json/?fields=lat,lon,city,regionName,country");
      const data = await res.json();
      if (data.lat && data.lon) {
        return {
          latitude: data.lat,
          longitude: data.lon,
          city: data.city ?? undefined,
          region: data.regionName ?? undefined,
          country: data.country ?? undefined,
        };
      }
    } catch {
      // IP lookup failed — silently continue
    }
    return null;
  }, []);

  // ── Web geolocation ───────────────────────────────────────────────
  const getWebLocation = useCallback((): Promise<UserLocation | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 }
      );
    });
  }, []);

  // ── Native geolocation (expo-location) ────────────────────────────
  const getNativeLocation = useCallback(async (): Promise<UserLocation | null> => {
    try {
      // Lazy require to avoid TS1323 dynamic import errors
      const Location = require("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    } catch {
      return null;
    }
  }, []);

  // ── Reverse geocode to get city/region/country ─────────────────────
  const reverseGeocode = useCallback(async (loc: UserLocation): Promise<UserLocation> => {
    // Use IP API for reverse geocoding (simple, no API key needed)
    try {
      const res = await fetch(
        `http://ip-api.com/json/?fields=city,regionName,country`
      );
      const data = await res.json();
      return {
        ...loc,
        city: loc.city ?? data.city ?? undefined,
        region: loc.region ?? data.regionName ?? undefined,
        country: loc.country ?? data.country ?? undefined,
      };
    } catch {
      return loc;
    }
  }, []);

  // ── Main request function ─────────────────────────────────────────
  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result: UserLocation | null = null;

      // Try platform-specific geolocation first
      if (Platform.OS === "web") {
        result = await getWebLocation();
      } else {
        result = await getNativeLocation();
      }

      // Fallback to IP-based location
      if (!result) {
        result = await getLocationByIP();
      }

      if (result) {
        // Enrich with city/region if not already present
        if (!result.city) {
          result = await reverseGeocode(result);
        }
        setLocation(result);
      } else {
        setError("Could not determine your location");
      }
    } catch (err: any) {
      setError(err?.message ?? "Location request failed");
    } finally {
      setIsLoading(false);
    }
  }, [getWebLocation, getNativeLocation, getLocationByIP, reverseGeocode]);

  // Auto-request via IP on mount (non-intrusive, no permission needed)
  useEffect(() => {
    if (!location) {
      getLocationByIP().then((ipLoc) => {
        if (ipLoc) setLocation(ipLoc);
      });
    }
  }, []);

  return { location, isLoading, error, requestLocation };
}

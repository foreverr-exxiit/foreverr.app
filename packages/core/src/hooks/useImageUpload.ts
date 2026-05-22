/**
 * useImageUpload — Handles image picking, compression, and upload to Supabase Storage.
 * Reusable across all screens that need photo upload.
 *
 * Usage:
 *   const { pickImage, takePhoto, uploadImage, isUploading, progress } = useImageUpload("memorial-photos");
 *   const result = await pickImage(); // Opens gallery
 *   if (result) {
 *     const url = await uploadImage(result.uri, `memorials/${memorialId}`);
 *   }
 */

import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase/client";
import { useAuth } from "./useAuth";
import { captureException } from "../services/errorReporting";

// ── Types ──────────────────────────────────────────────────

export interface ImagePickResult {
  uri: string;
  width: number;
  height: number;
  fileName: string;
  mimeType: string;
  fileSize?: number;
}

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
}

interface UseImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  allowsEditing?: boolean;
  aspect?: [number, number];
}

// ── Constants ──────────────────────────────────────────────

const DEFAULT_OPTIONS: UseImageUploadOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  allowsEditing: true,
  aspect: [1, 1],
};

// ── Hook ───────────────────────────────────────────────────

export function useImageUpload(
  bucket: string = "photos",
  options?: UseImageUploadOptions
) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // ── Request permissions ──
  const ensurePermissions = useCallback(async (type: "camera" | "gallery"): Promise<boolean> => {
    if (Platform.OS === "web") return true;

    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Needed",
          "Please enable camera access in your device settings to take photos."
        );
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Photo Library Permission Needed",
          "Please enable photo library access in your device settings to select photos."
        );
        return false;
      }
    }
    return true;
  }, []);

  // ── Pick from gallery ──
  const pickImage = useCallback(async (): Promise<ImagePickResult | null> => {
    setError(null);

    const hasPermission = await ensurePermissions("gallery");
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: opts.allowsEditing,
        aspect: opts.aspect,
        quality: opts.quality,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileSize: asset.fileSize,
      };
    } catch (err: any) {
      setError(err.message ?? "Failed to pick image");
      return null;
    }
  }, [opts, ensurePermissions]);

  // ── Pick multiple images ──
  const pickMultipleImages = useCallback(async (selectionLimit = 10): Promise<ImagePickResult[]> => {
    setError(null);

    const hasPermission = await ensurePermissions("gallery");
    if (!hasPermission) return [];

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit,
        quality: opts.quality,
      });

      if (result.canceled || !result.assets) return [];

      return result.assets.map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileSize: asset.fileSize,
      }));
    } catch (err: any) {
      setError(err.message ?? "Failed to pick images");
      return [];
    }
  }, [opts, ensurePermissions]);

  // ── Take photo with camera ──
  const takePhoto = useCallback(async (): Promise<ImagePickResult | null> => {
    setError(null);

    const hasPermission = await ensurePermissions("camera");
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: opts.allowsEditing,
        aspect: opts.aspect,
        quality: opts.quality,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName ?? `camera_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
        fileSize: asset.fileSize,
      };
    } catch (err: any) {
      setError(err.message ?? "Failed to take photo");
      return null;
    }
  }, [opts, ensurePermissions]);

  // ── Upload to Supabase Storage ──
  const uploadImage = useCallback(async (
    uri: string,
    folder: string = "uploads",
    fileName?: string
  ): Promise<UploadResult | null> => {
    if (!user?.id) {
      setError("Must be logged in to upload");
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Generate unique file path
      const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const uniqueName = fileName ?? `${user.id}_${Date.now()}.${ext}`;
      const filePath = `${folder}/${uniqueName}`;

      setProgress(0.1);

      // Fetch the file as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      setProgress(0.3);

      // Convert to ArrayBuffer for Supabase
      const arrayBuffer = await blob.arrayBuffer();

      setProgress(0.5);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          contentType: blob.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setProgress(0.9);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(1);
      setIsUploading(false);

      return {
        url: urlData.publicUrl,
        path: data.path,
        bucket,
      };
    } catch (err: any) {
      captureException(err, { where: "useImageUpload.uploadImage", bucket });
      setIsUploading(false);
      setProgress(0);
      setError(err.message ?? "Upload failed");
      return null;
    }
  }, [user?.id, bucket]);

  // ── Upload multiple images ──
  const uploadMultipleImages = useCallback(async (
    images: ImagePickResult[],
    folder: string = "uploads"
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];

    for (let i = 0; i < images.length; i++) {
      setProgress((i / images.length) * 100);
      const result = await uploadImage(images[i].uri, folder);
      if (result) results.push(result);
    }

    setProgress(100);
    return results;
  }, [uploadImage]);

  // ── Delete from Supabase Storage ──
  const deleteImage = useCallback(async (path: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      captureException(err, { where: "useImageUpload.deleteImage", bucket });
      setError(err.message ?? "Delete failed");
      return false;
    }
  }, [bucket]);

  // ── Quick pick + upload combo ──
  const pickAndUpload = useCallback(async (
    folder: string = "uploads"
  ): Promise<UploadResult | null> => {
    const image = await pickImage();
    if (!image) return null;
    return uploadImage(image.uri, folder);
  }, [pickImage, uploadImage]);

  const takeAndUpload = useCallback(async (
    folder: string = "uploads"
  ): Promise<UploadResult | null> => {
    const image = await takePhoto();
    if (!image) return null;
    return uploadImage(image.uri, folder);
  }, [takePhoto, uploadImage]);

  return {
    // Pickers
    pickImage,
    pickMultipleImages,
    takePhoto,

    // Upload
    uploadImage,
    uploadMultipleImages,
    deleteImage,

    // Combos
    pickAndUpload,
    takeAndUpload,

    // State
    isUploading,
    progress,
    error,
  };
}

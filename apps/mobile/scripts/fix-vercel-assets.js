#!/usr/bin/env node
/**
 * fix-vercel-assets.js
 *
 * Vercel strips `node_modules/` directories from deployments.
 * Expo web export puts vector icon fonts under `dist/assets/node_modules/`
 * but Google Fonts under `dist/assets/__node_modules/` (which Vercel keeps).
 *
 * This script:
 * 1. Renames `dist/assets/node_modules` → `dist/assets/__node_modules_icons`
 * 2. Patches the JS bundle to reference the new path
 */

const fs = require("fs");
const path = require("path");

const DIST_DIR = path.join(__dirname, "..", "dist");
const ASSETS_DIR = path.join(DIST_DIR, "assets");
const OLD_DIR = path.join(ASSETS_DIR, "node_modules");
const NEW_DIR = path.join(ASSETS_DIR, "__node_modules_icons");
const JS_DIR = path.join(DIST_DIR, "_expo", "static", "js", "web");

// Old and new path segments (as they appear in the JS bundle)
const OLD_PATH = "assets/node_modules/";
const NEW_PATH = "assets/__node_modules_icons/";

function main() {
  console.log("🔧 Fixing Vercel asset paths...\n");

  // Step 1: Rename the directory
  if (fs.existsSync(OLD_DIR)) {
    // Remove target if it already exists (from a previous run)
    if (fs.existsSync(NEW_DIR)) {
      fs.rmSync(NEW_DIR, { recursive: true });
    }
    fs.renameSync(OLD_DIR, NEW_DIR);
    console.log(`✅ Renamed:\n   ${OLD_DIR}\n   → ${NEW_DIR}\n`);
  } else if (fs.existsSync(NEW_DIR)) {
    console.log("ℹ️  Already renamed (node_modules → __node_modules_icons).\n");
  } else {
    console.log("⚠️  No node_modules directory found in dist/assets/. Skipping rename.\n");
  }

  // Step 2: Patch JS bundle references
  if (!fs.existsSync(JS_DIR)) {
    console.log("⚠️  No JS bundle directory found. Skipping patch.\n");
    return;
  }

  const jsFiles = fs.readdirSync(JS_DIR).filter((f) => f.endsWith(".js"));
  let patchedCount = 0;

  for (const file of jsFiles) {
    const filePath = path.join(JS_DIR, file);
    let content = fs.readFileSync(filePath, "utf-8");

    if (content.includes(OLD_PATH)) {
      // Replace all occurrences of the old path with the new one
      const before = content;
      content = content.split(OLD_PATH).join(NEW_PATH);

      if (content !== before) {
        fs.writeFileSync(filePath, content, "utf-8");
        const count = (before.match(new RegExp(OLD_PATH.replace("/", "\\/"), "g")) || []).length;
        console.log(`✅ Patched ${file}: ${count} reference(s) updated`);
        patchedCount++;
      }
    }
  }

  if (patchedCount === 0) {
    console.log("ℹ️  No JS bundle references needed patching.\n");
  }

  // Step 3: Copy vercel.json into dist for dynamic route rewrites
  const vercelSrc = path.join(__dirname, "..", "vercel.json");
  const vercelDst = path.join(DIST_DIR, "vercel.json");
  if (fs.existsSync(vercelSrc)) {
    fs.copyFileSync(vercelSrc, vercelDst);
    console.log("✅ Copied vercel.json → dist/vercel.json\n");
  } else {
    console.log("⚠️  No vercel.json found in project root. Skipping copy.\n");
  }

  // Step 4: Re-link dist to the foreverr-app Vercel project
  // (expo export wipes dist/, so the .vercel link is lost each build)
  const vercelDir = path.join(DIST_DIR, ".vercel");
  const projectJson = path.join(vercelDir, "project.json");
  if (!fs.existsSync(projectJson)) {
    if (!fs.existsSync(vercelDir)) {
      fs.mkdirSync(vercelDir, { recursive: true });
    }
    fs.writeFileSync(
      projectJson,
      JSON.stringify({
        projectId: "prj_Ax5L6mFH4fzfShaB0JhzJvCk7P2n",
        orgId: "team_1iYRFSNJiON77DPYiCV3WU8U",
        projectName: "foreverr-app",
      }),
      "utf-8"
    );
    console.log("✅ Re-linked dist/.vercel → foreverr-app project\n");
  }

  console.log("\n🎉 Done! dist/ is ready for Vercel deployment.\n");
}

main();

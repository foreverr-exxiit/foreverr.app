import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* SEO / page metadata */}
        <title>ǝterrn — Lifecycle memorials and celebrations</title>
        <meta
          name="description"
          content="Capture every chapter — birth, milestones, weddings, pets, and memorialization. ǝterrn is a lifecycle social platform that honors and celebrates the people you love."
        />
        <meta name="theme-color" content="#4A2D7A" />
        <link rel="canonical" href="https://eterrn.app/" />

        {/* Open Graph — link previews on Facebook, Messenger, LinkedIn, iMessage */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ǝterrn" />
        <meta
          property="og:title"
          content="ǝterrn — Lifecycle memorials and celebrations"
        />
        <meta
          property="og:description"
          content="Capture every chapter — birth, milestones, weddings, pets, and memorialization. A lifecycle social platform that honors and celebrates the people you love."
        />
        <meta property="og:url" content="https://eterrn.app/" />
        <meta
          property="og:image"
          content="https://eterrn.app/assets/images/eterrn-logo.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter / X card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="ǝterrn — Lifecycle memorials and celebrations"
        />
        <meta
          name="twitter:description"
          content="Capture every chapter — birth, milestones, weddings, pets, and memorialization."
        />
        <meta
          name="twitter:image"
          content="https://eterrn.app/assets/images/eterrn-logo.png"
        />

        {/* Apple mobile web app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="ǝterrn" />
        <link
          rel="apple-touch-icon"
          href="/assets/images/eterrn-favicon.png"
        />

        {/* Load @expo/vector-icons fonts from CDN for web */}
        <style dangerouslySetInnerHTML={{ __html: iconFontStyles }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

const ICON_FONT_CDN = "https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.4/build/vendor/react-native-vector-icons/Fonts";

const iconFontStyles = `
@font-face {
  font-family: 'Ionicons';
  src: url('${ICON_FONT_CDN}/Ionicons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'MaterialIcons';
  src: url('${ICON_FONT_CDN}/MaterialIcons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'MaterialCommunityIcons';
  src: url('${ICON_FONT_CDN}/MaterialCommunityIcons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome';
  src: url('${ICON_FONT_CDN}/FontAwesome.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5_Regular';
  src: url('${ICON_FONT_CDN}/FontAwesome5_Regular.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'FontAwesome5_Solid';
  src: url('${ICON_FONT_CDN}/FontAwesome5_Solid.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Feather';
  src: url('${ICON_FONT_CDN}/Feather.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Entypo';
  src: url('${ICON_FONT_CDN}/Entypo.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'AntDesign';
  src: url('${ICON_FONT_CDN}/AntDesign.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'SimpleLineIcons';
  src: url('${ICON_FONT_CDN}/SimpleLineIcons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'EvilIcons';
  src: url('${ICON_FONT_CDN}/EvilIcons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Octicons';
  src: url('${ICON_FONT_CDN}/Octicons.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'Foundation';
  src: url('${ICON_FONT_CDN}/Foundation.ttf') format('truetype');
  font-display: swap;
}
`;

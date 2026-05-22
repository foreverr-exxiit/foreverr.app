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

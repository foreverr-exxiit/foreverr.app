import { View, ScrollView, Pressable } from "react-native";
import { useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 leading-5 mb-2">{children}</Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row pl-2 mb-1.5">
      <Text className="text-xs font-sans text-gray-400 mr-2">{"\u2022"}</Text>
      <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 leading-5 flex-1">{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/settings" as any);
  }, [router]);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-900 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Privacy Policy</Text>
            <Text className="text-xs font-sans text-gray-400 mt-0.5">Last updated: March 1, 2026</Text>
          </View>
        </View>
      </View>

      <View className="px-5 pt-5 pb-10">
        <P>
          Eckzet Group ("Company", "we", "us", or "our") operates the ǝterrn application and related services. This Privacy Policy describes how we collect, use, share, and protect your personal information when you use our Service.
        </P>

        <Section title="1. Information We Collect">
          <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">Information You Provide</Text>
          <Bullet>Account information: name, email address, phone number, date of birth, profile photo</Bullet>
          <Bullet>Memorial content: names, dates, photos, stories, tributes, and biographical information about memorialized individuals</Bullet>
          <Bullet>User-generated content: tributes, appreciation letters, Core Letters, comments, and messages</Bullet>
          <Bullet>Payment information: processed securely through Stripe; we do not store your full credit card details</Bullet>
          <Bullet>Communications: messages you send to other users, support inquiries, and feedback</Bullet>

          <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5 mt-3">Information Collected Automatically</Text>
          <Bullet>Device information: device type, operating system, unique device identifiers, and mobile network information</Bullet>
          <Bullet>Usage data: pages viewed, features used, time spent on the app, and interaction patterns</Bullet>
          <Bullet>Location data: approximate location based on IP address (precise location only if you grant permission)</Bullet>
          <Bullet>Log data: IP address, browser type, access times, and referring URLs</Bullet>
          <Bullet>Cookies and similar technologies: used to maintain sessions, remember preferences, and analyze usage</Bullet>
        </Section>

        <Section title="2. How We Use Your Information">
          <P>We use the information we collect to:</P>
          <Bullet>Provide, maintain, and improve the Service</Bullet>
          <Bullet>Create and manage your account</Bullet>
          <Bullet>Process transactions and send related notices</Bullet>
          <Bullet>Send you push notifications and email communications (with your consent)</Bullet>
          <Bullet>Personalize your experience, including memorial and tribute recommendations</Bullet>
          <Bullet>Power AI features including writing assistance, photo restoration, and content suggestions</Bullet>
          <Bullet>Detect, investigate, and prevent fraudulent transactions and abuse</Bullet>
          <Bullet>Comply with legal obligations and enforce our Terms of Service</Bullet>
          <Bullet>Conduct analytics and research to improve the Service</Bullet>
          <Bullet>Communicate with you about products, services, offers, and events</Bullet>
        </Section>

        <Section title="3. How We Share Your Information">
          <P>We do not sell your personal information to third parties. We may share your information in the following circumstances:</P>
          <Bullet>With your consent: When you direct us to share information with third parties</Bullet>
          <Bullet>Service providers: With vendors who perform services on our behalf (hosting, payment processing, email delivery, analytics, AI processing)</Bullet>
          <Bullet>Legal compliance: When required by law, regulation, legal process, or governmental request</Bullet>
          <Bullet>Safety and fraud prevention: To protect the rights, property, or safety of Eckzet Group, our users, or the public</Bullet>
          <Bullet>Business transfers: In connection with a merger, acquisition, or sale of all or a portion of our assets</Bullet>
          <Bullet>Public content: Memorial pages, tributes, and other content you choose to make public are visible to all users</Bullet>
        </Section>

        <Section title="4. AI and Automated Processing">
          <P>
            ǝterrn uses artificial intelligence to provide writing suggestions, content moderation, photo restoration, and personalized experiences. When you use AI features:
          </P>
          <Bullet>Your content may be sent to third-party AI providers (OpenAI) for processing</Bullet>
          <Bullet>We do not use your personal content to train AI models</Bullet>
          <Bullet>AI-generated suggestions are created in real-time and are not permanently stored beyond the context of your session</Bullet>
          <Bullet>You maintain full control over whether to accept, modify, or reject AI suggestions</Bullet>
          <Bullet>Content moderation uses AI to detect potentially harmful or inappropriate content</Bullet>
        </Section>

        <Section title="5. Data Retention">
          <P>
            We retain your personal information for as long as your account is active or as needed to provide you with the Service. Memorial content may be retained indefinitely as part of the permanent memorial record, unless deletion is requested by an authorized individual.
          </P>
          <P>
            Upon account deletion, your personal data will be removed within 30 days, except where retention is required by law or for legitimate business purposes (such as resolving disputes or enforcing our agreements).
          </P>
        </Section>

        <Section title="6. Data Security">
          <P>
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </P>
          <Bullet>Encryption of data in transit (TLS/SSL) and at rest</Bullet>
          <Bullet>Regular security audits and vulnerability assessments</Bullet>
          <Bullet>Access controls limiting employee access to personal data</Bullet>
          <Bullet>Secure payment processing through PCI-DSS compliant providers</Bullet>
          <P>
            While we strive to protect your data, no method of transmission or storage is 100% secure. We cannot guarantee absolute security of your information.
          </P>
        </Section>

        <Section title="7. Your Rights and Choices">
          <P>Depending on your location, you may have the following rights regarding your personal information:</P>
          <Bullet>Access: Request a copy of the personal information we hold about you</Bullet>
          <Bullet>Correction: Request correction of inaccurate or incomplete information</Bullet>
          <Bullet>Deletion: Request deletion of your personal data (subject to legal retention requirements)</Bullet>
          <Bullet>Portability: Request a machine-readable copy of your data</Bullet>
          <Bullet>Opt-out: Unsubscribe from marketing communications at any time</Bullet>
          <Bullet>Restrict processing: Request that we limit how we use your data</Bullet>
          <Bullet>Object: Object to processing of your data for certain purposes</Bullet>
          <P>
            To exercise any of these rights, please contact us at privacy@eterrn.app or use the Privacy &amp; Security settings in the app.
          </P>
        </Section>

        <Section title="8. Children's Privacy">
          <P>
            ǝterrn is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
          </P>
          <P>
            Users between 13 and 18 may use the Service with the consent of a parent or legal guardian, who assumes responsibility for the minor's use of the Service.
          </P>
        </Section>

        <Section title="9. International Data Transfers">
          <P>
            Eckzet Group operates from the United States and Ghana. Your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate. By using the Service, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection rules.
          </P>
          <P>
            For users in the European Economic Area (EEA) and United Kingdom, we rely on Standard Contractual Clauses or other lawful transfer mechanisms to ensure adequate protection of your data.
          </P>
        </Section>

        <Section title="10. California Privacy Rights (CCPA)">
          <P>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your information, and the right to opt out of the sale of your information. We do not sell personal information.
          </P>
        </Section>

        <Section title="11. Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy within the app and updating the "Last updated" date. Your continued use of the Service after changes are posted constitutes acceptance of the updated policy.
          </P>
        </Section>

        <Section title="12. Contact Us">
          <P>
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
          </P>
          <P>Eckzet Group</P>
          <P>New York City, New York, United States</P>
          <P>HO, Volta Region, Ghana</P>
          <P>Email: privacy@eterrn.app</P>
          <P>Data Protection Officer: dpo@eterrn.app</P>
        </Section>
      </View>
    </ScrollView>
  );
}

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

export default function TermsOfServiceScreen() {
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
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Terms of Service</Text>
            <Text className="text-xs font-sans text-gray-400 mt-0.5">Last updated: March 1, 2026</Text>
          </View>
        </View>
      </View>

      <View className="px-5 pt-5 pb-10">
        <Section title="1. Agreement to Terms">
          <P>
            Welcome to ǝterrn. These Terms of Service ("Terms") govern your access to and use of the ǝterrn application, website, and related services (collectively, the "Service") operated by Eckzet Group ("Company", "we", "us", or "our"), a corporation with operations based in New York City, United States, and headquarters in Volta Region, Ghana.
          </P>
          <P>
            By creating an account or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
          </P>
        </Section>

        <Section title="2. Eligibility">
          <P>You must be at least 13 years old to use ǝterrn. If you are under 18, you must have the consent of a parent or legal guardian. By using the Service, you represent and warrant that:</P>
          <Bullet>You are at least 13 years of age</Bullet>
          <Bullet>You have the legal capacity to enter into a binding agreement</Bullet>
          <Bullet>You are not barred from using the Service under applicable law</Bullet>
          <Bullet>You will comply with these Terms and all applicable laws and regulations</Bullet>
        </Section>

        <Section title="3. Your Account">
          <P>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
          </P>
          <P>
            You agree to provide accurate, current, and complete information when creating your account and to keep this information up to date. We reserve the right to suspend or terminate accounts that contain inaccurate or misleading information.
          </P>
        </Section>

        <Section title="4. Content and Conduct">
          <P>You retain ownership of the content you post on ǝterrn, including tributes, memorials, photos, letters, and other materials ("User Content"). By posting User Content, you grant Eckzet Group a non-exclusive, worldwide, royalty-free, transferable license to use, display, reproduce, distribute, and store your User Content in connection with operating and improving the Service.</P>
          <P>You agree not to post content that:</P>
          <Bullet>Is unlawful, defamatory, obscene, or hateful</Bullet>
          <Bullet>Infringes on the intellectual property rights of others</Bullet>
          <Bullet>Contains malware, spam, or unauthorized advertising</Bullet>
          <Bullet>Impersonates another person or misrepresents your identity</Bullet>
          <Bullet>Violates the privacy or rights of any third party</Bullet>
          <Bullet>Is fraudulent or intended to deceive other users</Bullet>
          <Bullet>Promotes violence, discrimination, or illegal activities</Bullet>
          <P>We reserve the right to remove any content that violates these Terms and to suspend or terminate the accounts of users who repeatedly violate these guidelines.</P>
        </Section>

        <Section title="5. Memorial Content">
          <P>
            ǝterrn provides a platform for creating and maintaining memorials and tributes for individuals across all stages of life. You represent that you have the right and authority to create memorials for the individuals described and that the information provided is accurate to the best of your knowledge.
          </P>
          <P>
            Memorial content is intended to honor and celebrate individuals. Content that disrespects, defaces, or misrepresents the memory of any individual may be removed at our discretion. We may appoint memorial guardians or trusted contacts to manage memorial pages in accordance with the wishes of the account holder.
          </P>
        </Section>

        <Section title="6. Gifts, Donations, and Payments">
          <P>
            ǝterrn facilitates virtual gift-giving, ribbon purchases, and charitable contributions. All purchases are processed through our authorized payment providers including Stripe and RevenueCat.
          </P>
          <Bullet>Virtual gifts and ribbons are digital items with no cash value and are non-refundable once sent</Bullet>
          <Bullet>Donation amounts and recipients are displayed as provided by campaign organizers; Eckzet Group does not guarantee the use of donated funds</Bullet>
          <Bullet>Premium subscription fees are billed in advance on a recurring basis and may be cancelled at any time</Bullet>
          <Bullet>All prices are displayed in US Dollars unless otherwise indicated</Bullet>
          <Bullet>We reserve the right to modify pricing at any time with prior notice to active subscribers</Bullet>
        </Section>

        <Section title="7. AI-Generated Content">
          <P>
            ǝterrn offers AI-powered writing assistance for tributes, obituaries, biographies, and other content. AI-generated content is provided as suggestions only and should be reviewed and edited before publishing.
          </P>
          <P>
            Eckzet Group makes no warranty regarding the accuracy, appropriateness, or completeness of AI-generated content. You are solely responsible for any content you publish, whether written by you or assisted by AI features.
          </P>
        </Section>

        <Section title="8. Intellectual Property">
          <P>
            The ǝterrn name, logo, interface design, and all associated trademarks, service marks, and trade dress are the property of Eckzet Group. You may not copy, modify, distribute, or create derivative works based on any part of the Service without our express written permission.
          </P>
          <P>
            The Service may contain content licensed from third parties. Such content is protected by applicable intellectual property laws and treaties.
          </P>
        </Section>

        <Section title="9. Limitation of Liability">
          <P>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, ECKZET GROUP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </P>
          <P>
            Our total liability for any claim arising out of or relating to these Terms or the Service shall not exceed the amount you have paid to us in the twelve (12) months preceding the claim.
          </P>
        </Section>

        <Section title="10. Indemnification">
          <P>
            You agree to indemnify, defend, and hold harmless Eckzet Group, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in connection with your use of the Service, your User Content, or your violation of these Terms.
          </P>
        </Section>

        <Section title="11. Termination">
          <P>
            We may terminate or suspend your account at any time, with or without cause, with or without notice. Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
          </P>
          <P>
            You may delete your account at any time through the Privacy &amp; Security settings. Upon deletion, your personal data will be removed in accordance with our Privacy Policy and applicable data retention requirements.
          </P>
        </Section>

        <Section title="12. Modifications to Terms">
          <P>
            Eckzet Group reserves the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on the Service and updating the "Last updated" date. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.
          </P>
        </Section>

        <Section title="13. Governing Law">
          <P>
            These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in New York County, New York.
          </P>
        </Section>

        <Section title="14. Contact Us">
          <P>
            If you have any questions about these Terms, please contact us:
          </P>
          <P>Eckzet Group</P>
          <P>New York City, New York, United States</P>
          <P>HO, Volta Region, Ghana</P>
          <P>Email: legal@eterrn.app</P>
        </Section>
      </View>
    </ScrollView>
  );
}

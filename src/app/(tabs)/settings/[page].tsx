import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/screen';
import { DetailHeading } from '@/components/detail-heading';
import { colors } from '@/design/tokens';
import { LegalDocumentScreen } from '@/features/legal/legal-document-screen';
import { privacyPolicyMarkdown, termsOfServiceMarkdown } from '@/legal/legal-documents';
const pages = {
  usage: { title: 'Usage', heading: 'Your recommendation allowance.', copy: 'Usage is enforced by the Which Drake? server. Open the dedicated Usage page to see your current plan and recommendations remaining.' },
  about: { title: 'About Which Drake?', heading: 'There’s a Drake song for every situation. Which one is yours?', copy: 'Describe what you’re going through and Which Drake? will look for the released Drake song that most specifically fits.\n\nWhich Drake? is an independent app and is not endorsed by or affiliated with Drake, his representatives, record labels, Spotify, or Apple.' },
} as const;
export function generateStaticParams() { return ['about', 'privacy', 'terms'].map(page => ({ page })); }
export default function SettingsPage() {
  const { page } = useLocalSearchParams<{ page: string }>();
  if (page === 'privacy') return <LegalDocumentScreen title="Privacy Policy" markdown={privacyPolicyMarkdown} />;
  if (page === 'terms') return <LegalDocumentScreen title="Terms of Service" markdown={termsOfServiceMarkdown} />;
  const content = pages[page as keyof typeof pages] ?? { title: 'Settings', heading: 'Page not found.', copy: 'Return to Settings to continue.' };
  return <Screen><DetailHeading title={content.title} /><Text accessibilityRole="header" style={styles.heading}>{content.heading}</Text><Text style={styles.copy}>{content.copy}</Text></Screen>;
}
const styles = StyleSheet.create({
  heading: { color: colors.ink, fontSize: 26, lineHeight: 34, fontWeight: '600', letterSpacing: -0.5, marginBottom: 20 },
  copy: { color: colors.secondary, fontSize: 17, lineHeight: 26 },
});

import { StyleSheet, Text, View } from 'react-native';
import { DetailHeading } from '@/components/detail-heading';
import { Screen } from '@/components/screen';
import { colors } from '@/design/tokens';

type Block = { kind: 'heading' | 'paragraph' | 'bullet' | 'table'; text: string; level?: number };

function cleanInline(value: string) {
  return value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 — $2').replace(/\*\*/g, '').replace(/`([^`]+)`/g, '$1').trim();
}

export function parseLegalMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', text: cleanInline(paragraph.join(' ')) });
    paragraph = [];
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flush(); continue; }
    if (/^\|[\s|:-]+\|$/.test(line)) continue;
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) { flush(); blocks.push({ kind: 'heading', level: heading[1].length, text: cleanInline(heading[2]) }); continue; }
    if (/^[-*]\s+/.test(line)) { flush(); blocks.push({ kind: 'bullet', text: cleanInline(line.replace(/^[-*]\s+/, '')) }); continue; }
    if (line.startsWith('|') && line.endsWith('|')) {
      flush(); blocks.push({ kind: 'table', text: line.slice(1, -1).split('|').map(cleanInline).join('  ·  ') }); continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

export function LegalDocumentScreen({ title, markdown }: { title: string; markdown: string }) {
  const blocks = parseLegalMarkdown(markdown);
  return <Screen><DetailHeading title={title} /><View style={styles.document}>
    {blocks.map((block, index) => {
      if (block.kind === 'heading') {
        if (block.level === 1) return null;
        return <Text key={index} accessibilityRole="header" style={block.level === 2 ? styles.heading : styles.subheading}>{block.text}</Text>;
      }
      if (block.kind === 'bullet') return <View key={index} style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.copy}>{block.text}</Text></View>;
      if (block.kind === 'table') return <Text key={index} style={styles.table}>{block.text}</Text>;
      return <Text key={index} style={styles.copy}>{block.text}</Text>;
    })}
  </View></Screen>;
}

const styles = StyleSheet.create({
  document: { gap: 14, paddingBottom: 30 }, heading: { color: colors.ink, fontSize: 23, lineHeight: 30, fontWeight: '700', marginTop: 18 },
  subheading: { color: colors.ink, fontSize: 18, lineHeight: 25, fontWeight: '600', marginTop: 10 }, copy: { flex: 1, color: colors.secondary, fontSize: 15, lineHeight: 23 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingLeft: 4 }, bullet: { color: colors.blue, fontSize: 17, lineHeight: 23 },
  table: { color: colors.ink, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, lineHeight: 19 },
});

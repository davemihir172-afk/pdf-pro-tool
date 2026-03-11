import { SeoToolPage } from '../../components/seo-tool-page';
import { seoTools, buildMetadata } from '../../lib/seo-tools';

export const metadata = buildMetadata(seoTools['pdf-to-word']);

export default function Page() {
  return <SeoToolPage slug="pdf-to-word" />;
}

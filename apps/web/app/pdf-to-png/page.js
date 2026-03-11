import { SeoToolPage } from '../../components/seo-tool-page';
import { seoTools, buildMetadata } from '../../lib/seo-tools';

export const metadata = buildMetadata(seoTools['pdf-to-png']);

export default function Page() {
  return <SeoToolPage slug="pdf-to-png" />;
}

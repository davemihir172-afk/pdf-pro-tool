import { SeoToolPage } from '../../components/seo-tool-page';
import { seoTools, buildMetadata } from '../../lib/seo-tools';

export const metadata = buildMetadata(seoTools['split-pdf']);

export default function Page() {
  return <SeoToolPage slug="split-pdf" />;
}

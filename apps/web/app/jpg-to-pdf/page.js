import { SeoToolPage } from '../../components/seo-tool-page';
import { seoTools, buildMetadata } from '../../lib/seo-tools';

export const metadata = buildMetadata(seoTools['jpg-to-pdf']);

export default function Page() {
  return <SeoToolPage slug="jpg-to-pdf" />;
}

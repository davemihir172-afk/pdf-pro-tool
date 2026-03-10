import { notFound } from 'next/navigation';
import { ToolWorkbench } from '../../../components/tool-workbench';
import { toolMap } from '../../../components/tool-catalog';

export default function ToolPage({ params }) {
  const tool = toolMap[params.slug];
  if (!tool) return notFound();
  return <ToolWorkbench tool={tool} />;
}

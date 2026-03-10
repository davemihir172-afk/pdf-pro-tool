'use client';

import { motion } from 'framer-motion';
import { ToolCard } from '@propdfmate/ui';

export function ToolGrid({ tools }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-10 grid gap-5 sm:grid-cols-2"
    >
      {tools.map((tool) => (
        <ToolCard key={tool.title} {...tool} />
      ))}
    </motion.div>
  );
}

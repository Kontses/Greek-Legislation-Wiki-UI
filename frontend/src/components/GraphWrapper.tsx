'use client';

import dynamic from 'next/dynamic';

const KnowledgeGraph = dynamic(() => import('./KnowledgeGraph'), {
  ssr: false,
});

export default function GraphWrapper({ data }: { data: any }) {
  return <KnowledgeGraph data={data} />;
}

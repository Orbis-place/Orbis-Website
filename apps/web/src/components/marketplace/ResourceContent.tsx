'use client';

import { TiptapViewer } from '@/components/TiptapViewer';

export interface ResourceContentProps {
  content: string;
}

export default function ResourceContent({ content }: ResourceContentProps) {
  return (
    <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-6 sm:p-8">
      <TiptapViewer content={content} />
    </div>
  );
}

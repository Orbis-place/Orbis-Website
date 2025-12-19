import type { Metadata } from 'next';
import BlogCard, { BlogPost } from '@/components/blog/BlogCard';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Stay updated with the latest news, guides, and insights from the Hytale community on Orbis.',
};

// Mock data for blog posts
const MOCK_POSTS: BlogPost[] = [
    /*{
        id: '1',
        slug: 'hytale-beta-announcement',
        title: 'Hytale Beta: Everything You Need to Know',
        description: 'The long-awaited Hytale beta is finally approaching! Discover all the new features, gameplay mechanics, and what to expect from this revolutionary blocky adventure game.',
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
        author: 'hypixelstudios',
        authorDisplay: 'Hypixel Studios',
        date: 'Dec 5, 2025',
        readTime: '5 min read',
        category: 'Announcements'
    }*/
];

export default function BlogPage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-4">
                        <h1 className="font-hebden font-semibold text-4xl sm:text-5xl lg:text-6xl leading-tight text-[#C7F4FA] mb-4">
                            Orbis Blog
                        </h1>
                        <p className="font-nunito text-base sm:text-lg text-[#C7F4FA]/70 max-w-2xl mx-auto">
                            Stay updated with the latest news, guides, and insights from the Hytale community
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 lg:px-8 pb-20">
                <div className="max-w-7xl mx-auto">
                    {MOCK_POSTS.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="bg-[#06363D] border border-[#084B54] rounded-full p-8 mb-6">
                                <FileText className="w-16 h-16 text-[#109EB1]" />
                            </div>
                            <h2 className="font-hebden font-semibold text-2xl text-[#C7F4FA] mb-3">
                                No Articles Yet
                            </h2>
                            <p className="font-nunito text-base text-[#C7F4FA]/70 text-center max-w-md">
                                We're working on bringing you amazing content about Hytale, guides, and community updates. Check back soon!
                            </p>
                        </div>
                    ) : (
                        /* All Posts Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_POSTS.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { Icon } from '@iconify/react';

const features = [
    {
        icon: 'mdi:folder-multiple',
        title: 'File Explorer',
        description: 'Browse all server files: configs, worlds, logs, plugins. No external file manager needed.',
    },
    {
        icon: 'mdi:code-json',
        title: 'Config Editor',
        description: 'Built-in editor with YAML/JSON syntax highlighting. Validate configurations before saving.',
    },
    {
        icon: 'mdi:backup-restore',
        title: 'Backup & Restore',
        description: 'Create backups of worlds and configs with one click. Restore anytime. Never lose progress.',
    },
    {
        icon: 'mdi:share-variant',
        title: 'Import/Export Modpacks',
        description: 'Package your entire server config. Share with friends or import community setups.',
    },
];

const mockFiles = [
    { name: 'server.properties', type: 'file', icon: 'mdi:cog', size: '2.4 KB' },
    { name: 'worlds/', type: 'folder', icon: 'mdi:folder', items: '3 worlds' },
    { name: 'mods/', type: 'folder', icon: 'mdi:folder', items: '12 mods' },
    { name: 'config.yml', type: 'file', icon: 'mdi:code-json', size: '8.1 KB' },
    { name: 'logs/', type: 'folder', icon: 'mdi:folder', items: '24 files' },
];

export function FileManagement() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#032125]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#109EB1]/20 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:folder-cog" className="w-6 h-6 text-[#109EB1]" />
                    </div>
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl text-[#C7F4FA]">
                        File Management
                    </h2>
                </div>
                <p className="font-nunito text-lg text-[#C7F4FA]/70 max-w-2xl mb-12">
                    Full control over your server files without leaving the launcher. Edit configs, manage backups, and share setups.
                </p>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Features Cards */}
                    <div className="grid gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-[#06363D] border border-[#084B54] rounded-xl p-5 hover:border-[#109EB1]/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-[#109EB1]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon icon={feature.icon} className="w-6 h-6 text-[#109EB1]" />
                                    </div>
                                    <div>
                                        <h3 className="font-hebden font-semibold text-lg text-[#C7F4FA] mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="font-nunito text-sm text-[#C7F4FA]/60 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: File Explorer Mockup */}
                    <div className="bg-[#06363D] border border-[#084B54] rounded-2xl overflow-hidden">
                        {/* Explorer Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#032125] border-b border-[#084B54]">
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:folder-open" className="w-5 h-5 text-[#109EB1]" />
                                <span className="font-hebden text-sm text-[#C7F4FA]">File Explorer</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1.5 rounded hover:bg-[#06363D] text-[#C7F4FA]/50 hover:text-[#C7F4FA] transition-colors">
                                    <Icon icon="mdi:backup-restore" className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 rounded hover:bg-[#06363D] text-[#C7F4FA]/50 hover:text-[#C7F4FA] transition-colors">
                                    <Icon icon="mdi:refresh" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Breadcrumb */}
                        <div className="px-4 py-2 border-b border-[#084B54] text-sm">
                            <div className="flex items-center gap-1 text-[#C7F4FA]/50">
                                <Icon icon="mdi:home" className="w-4 h-4" />
                                <span>/</span>
                                <span className="text-[#109EB1]">MyServer</span>
                                <span>/</span>
                            </div>
                        </div>

                        {/* File List */}
                        <div className="divide-y divide-[#084B54]">
                            {mockFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-4 px-4 py-3 hover:bg-[#032125]/50 transition-colors cursor-pointer">
                                    <Icon
                                        icon={file.icon}
                                        className={`w-5 h-5 ${file.type === 'folder' ? 'text-[#f59e0b]' : 'text-[#109EB1]'}`}
                                    />
                                    <span className="flex-1 font-nunito text-sm text-[#C7F4FA]">{file.name}</span>
                                    <span className="text-xs text-[#C7F4FA]/40">
                                        {file.type === 'folder' ? file.items : file.size}
                                    </span>
                                    <button className="p-1 rounded hover:bg-[#109EB1]/20 text-[#C7F4FA]/50 hover:text-[#109EB1] transition-colors">
                                        <Icon icon="mdi:dots-vertical" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center gap-2 p-4 border-t border-[#084B54] bg-[#032125]">
                            <button className="flex items-center gap-2 px-3 py-2 bg-[#06363D] border border-[#084B54] hover:border-[#109EB1] rounded-lg text-xs font-hebden text-[#C7F4FA] transition-colors">
                                <Icon icon="mdi:file-plus" className="w-4 h-4" />
                                New File
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 bg-[#06363D] border border-[#084B54] hover:border-[#109EB1] rounded-lg text-xs font-hebden text-[#C7F4FA] transition-colors">
                                <Icon icon="mdi:folder-plus" className="w-4 h-4" />
                                New Folder
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 bg-[#109EB1] hover:bg-[#0d8a9a] rounded-lg text-xs font-hebden text-[#C7F4FA] transition-colors ml-auto">
                                <Icon icon="mdi:content-save" className="w-4 h-4" />
                                Backup All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

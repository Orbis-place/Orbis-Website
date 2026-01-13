'use client';

import { Icon } from '@iconify/react';

const steps = [
    {
        number: 1,
        icon: 'mdi:download',
        title: 'Download Freely',
        description: 'Get any resource instantly',
    },
    {
        number: 2,
        icon: 'mdi:gamepad-variant',
        title: 'Try it Out',
        description: 'Test it in your game, take your time',
    },
    {
        number: 3,
        icon: 'mdi:heart',
        title: 'Tip Creator',
        description: 'Loved it? Send some love to the creator',
    },
];

export function HowDonationsWork() {
    return (
        <section className="w-full py-20 px-4 md:px-8 bg-[#042a2f]">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-hebden font-bold text-3xl md:text-4xl lg:text-5xl text-[#C7F4FA] mb-4">
                        Support Creators, Your Way
                    </h2>
                    <p className="font-nunito text-lg text-[#C7F4FA]/80 max-w-xl mx-auto">
                        Download first, donate when you're ready. No pressure, ever.
                    </p>
                </div>

                {/* Steps */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-12">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            {/* Step Card */}
                            <div className={`flex flex-col items-center text-center p-6 ${step.number === 3 ? '' : ''
                                }`}>
                                {/* Number Badge */}
                                <div className="w-8 h-8 bg-[#109EB1]/30 rounded-full flex items-center justify-center mb-4">
                                    <span className="font-hebden font-bold text-sm text-[#109EB1]">{step.number}</span>
                                </div>

                                {/* Icon */}
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${step.number === 3
                                        ? 'bg-[#109EB1]/30'
                                        : 'bg-[#06363D] border border-[#084B54]'
                                    }`}>
                                    <Icon ssr={true} icon={step.icon}
                                        className={`w-10 h-10 ${step.number === 3 ? 'text-[#109EB1]' : 'text-[#C7F4FA]/80'
                                            }`}
                                    />
                                </div>

                                {/* Text */}
                                <h3 className="font-hebden font-semibold text-lg text-[#C7F4FA] mb-2">
                                    {step.title}
                                </h3>
                                <p className="font-nunito text-sm text-[#C7F4FA]/70 max-w-[160px]">
                                    {step.description}
                                </p>
                            </div>

                            {/* Arrow (not after last item) */}
                            {index < steps.length - 1 && (
                                <Icon ssr={true} icon="mdi:arrow-right"
                                    className="w-6 h-6 text-[#C7F4FA]/30 hidden md:block mx-4"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Additional Text */}
                <div className="text-center space-y-4">
                    <p className="font-nunito text-[#C7F4FA]/70 max-w-xl mx-auto">
                        We'll send you a gentle reminder after a few days — just in case you loved something and want to say thanks. But there's never any obligation.
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#109EB1]/10 rounded-full">
                        <Icon ssr={true} icon="mdi:heart" className="w-5 h-5 text-[#109EB1]" />
                        <span className="font-nunito text-sm text-[#C7F4FA]">
                            100% of tips go to creators. Orbis takes nothing.
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

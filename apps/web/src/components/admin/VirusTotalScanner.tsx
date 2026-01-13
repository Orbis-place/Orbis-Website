import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ScanResult {
    scanId: string;
    status: string;
    stats?: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
    };
    permalink?: string;
    mock?: boolean;
}

interface VirusTotalScannerProps {
    versionId: string;
    fileUrl: string;
    onScanComplete?: (result: ScanResult) => void;
}

export function VirusTotalScanner({ versionId, fileUrl, onScanComplete }: VirusTotalScannerProps) {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);

    const handleScan = async () => {
        setScanning(true);
        try {
            // 1. Trigger Scan
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/moderation/versions/${versionId}/scan?fileUrl=${encodeURIComponent(fileUrl)}`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            );

            if (!response.ok) throw new Error('Scan failed');

            const data = await response.json();

            if (data.status === 'completed') {
                setResult(data);
                onScanComplete?.(data);
            } else if (data.scanId) {
                // If queued, start polling
                pollResult(data.scanId);
            }

            if (data.mock) {
                toast.info("Using mock VT response (API key not configured)");
            }
        } catch (error) {
            console.error('Scan error:', error);
            toast.error('Failed to trigger scan');
            setScanning(false);
        }
    };

    const pollResult = async (analysisId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/moderation/analysis/${analysisId}`, {
                    credentials: 'include'
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'completed') {
                        setResult({ ...data, scanId: analysisId });
                        onScanComplete?.(data);
                        setScanning(false);
                        clearInterval(interval);
                        toast.success('Scan completed');
                    }
                    // If still queued/in-progress, keep polling
                }
            } catch (err) {
                console.error('Polling error', err);
                clearInterval(interval);
                setScanning(false);
                toast.error('Error checking scan status');
            }
        }, 5000); // Poll every 5 seconds

        // Cleanup interval on unmount (implied by closure, but better if we stored it in ref)
        // For simplicity here:
        setTimeout(() => {
            if (scanning) {
                clearInterval(interval);
                setScanning(false);
                // toast.error('Scan timed out'); 
            }
        }, 300000); // Stop after 5 minutes
    };

    if (result?.status === 'completed' && result.stats) {
        const isClean = result.stats.malicious === 0 && result.stats.suspicious === 0;

        return (
            <div className={cn(
                "rounded-lg border p-4",
                isClean ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
            )}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Icon ssr={true} icon="simple-icons:virustotal"
                            className="w-5 h-5 text-[#394EFF]"
                        />
                        <span className="font-hebden font-semibold text-sm">VirusTotal Report</span>
                    </div>
                    {isClean ? (
                        <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                            <Icon ssr={true} icon="mdi:check-circle" className="w-3.5 h-3.5" />
                            Clean
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                            <Icon ssr={true} icon="mdi:alert-circle" className="w-3.5 h-3.5" />
                            {result.stats.malicious} Malicious
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-2 bg-background/50 rounded">
                        <div className="text-lg font-bold text-red-500 leading-none">{result.stats.malicious}</div>
                        <div className="text-[10px] text-muted-foreground uppercase mt-1">Malicious</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded">
                        <div className="text-lg font-bold text-orange-500 leading-none">{result.stats.suspicious}</div>
                        <div className="text-[10px] text-muted-foreground uppercase mt-1">Suspicious</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded">
                        <div className="text-lg font-bold text-green-500 leading-none">{result.stats.harmless}</div>
                        <div className="text-[10px] text-muted-foreground uppercase mt-1">Harmless</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded">
                        <div className="text-lg font-bold text-gray-500 leading-none">{result.stats.undetected}</div>
                        <div className="text-[10px] text-muted-foreground uppercase mt-1">Undetected</div>
                    </div>
                </div>

                {result.permalink && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8"
                        onClick={() => window.open(result.permalink, '_blank')}
                    >
                        View Full Report
                        <Icon ssr={true} icon="mdi:external-link" className="w-3 h-3 ml-2" />
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border/30 bg-secondary/30 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon ssr={true} icon="simple-icons:virustotal"
                        className="w-5 h-5 text-muted-foreground"
                    />
                    <span className="font-hebden font-semibold text-sm text-muted-foreground">Security Scan</span>
                </div>
                <Button
                    size="sm"
                    onClick={handleScan}
                    disabled={scanning}
                    className={cn(
                        "h-8 text-xs bg-[#394EFF] hover:bg-[#394EFF]/90 text-white border-0",
                        scanning && "opacity-70"
                    )}
                >
                    {scanning ? (
                        <>
                            <Icon ssr={true} icon="mdi:loading" className="w-3.5 h-3.5 animate-spin mr-2" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Icon ssr={true} icon="mdi:radar" className="w-3.5 h-3.5 mr-2" />
                            Scan File
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

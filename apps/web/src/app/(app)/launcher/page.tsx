
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Download,
    Package,
    FolderOpen,
    Globe,
    RefreshCw,
    Monitor,
    Gamepad2,
    ChevronRight,
    Apple,
    Check
} from 'lucide-react';

type OS = 'windows' | 'macos' | 'linux' | 'unknown';

interface GitHubAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    tag_name: string;
    assets: GitHubAsset[];
}

function detectOS(): OS {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform.toLowerCase();

    if (platform.includes('win') || userAgent.includes('windows')) {
        return 'windows';
    }
    if (platform.includes('mac') || userAgent.includes('mac')) {
        return 'macos';
    }
    if (platform.includes('linux') || userAgent.includes('linux')) {
        return 'linux';
    }

    return 'unknown';
}

// Fallback download links in case the API fails
const fallbackDownloadLinks = {
    windows: 'https://github.com/Orbis-place/Orbis-Website/releases/latest',
    macos: 'https://github.com/Orbis-place/Orbis-Website/releases/latest',
    linux: 'https://github.com/Orbis-place/Orbis-Website/releases/latest',
};

const osNames = {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    unknown: 'Your Platform',
};

const osIcons = {
    windows: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
        </svg>
    ),
    macos: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
        </svg>
    ),
    linux: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>linux</title> <path d="M14.923 8.080c-0.025 0.072-0.141 0.061-0.207 0.082-0.059 0.031-0.107 0.085-0.175 0.085-0.062 0-0.162-0.025-0.17-0.085-0.012-0.082 0.11-0.166 0.187-0.166 0.050-0.024 0.108-0.037 0.169-0.037 0.056 0 0.109 0.011 0.157 0.032l-0.003-0.001c0.022 0.009 0.038 0.030 0.038 0.055 0 0.003-0 0.005-0.001 0.008l0-0v0.025h0.004zM15.611 8.080v-0.027c-0.008-0.025 0.016-0.052 0.036-0.062 0.046-0.020 0.1-0.032 0.157-0.032 0.061 0 0.119 0.014 0.17 0.038l-0.002-0.001c0.079 0 0.2 0.084 0.187 0.169-0.007 0.061-0.106 0.082-0.169 0.082-0.069 0-0.115-0.054-0.176-0.085-0.065-0.023-0.182-0.010-0.204-0.081zM16.963 10.058c-0.532 0.337-1.161 0.574-1.835 0.666l-0.024 0.003c-0.606-0.035-1.157-0.248-1.607-0.588l0.007 0.005c-0.192-0.167-0.35-0.335-0.466-0.419-0.205-0.167-0.18-0.416-0.092-0.416 0.136 0.020 0.161 0.167 0.249 0.25 0.12 0.082 0.269 0.25 0.45 0.416 0.397 0.328 0.899 0.541 1.45 0.583l0.009 0.001c0.654-0.057 1.249-0.267 1.763-0.592l-0.016 0.010c0.244-0.169 0.556-0.417 0.81-0.584 0.195-0.17 0.186-0.334 0.349-0.334 0.16 0.020 0.043 0.167-0.184 0.415-0.246 0.188-0.527 0.381-0.818 0.56l-0.044 0.025zM8.017 21.397h0.012c0.069 0 0.137 0.007 0.203 0.019l-0.007-0.001c0.544 0.14 0.992 0.478 1.273 0.931l0.005 0.009 1.137 2.079 0.004 0.004c0.457 0.773 0.948 1.442 1.497 2.059l-0.011-0.013c0.49 0.52 0.82 1.196 0.909 1.946l0.002 0.016v0.008c-0.012 0.817-0.613 1.491-1.396 1.616l-0.009 0.001c-0.2 0.031-0.432 0.048-0.667 0.048-0.857 0-1.659-0.233-2.347-0.64l0.021 0.012c-1.053-0.441-2.275-0.714-3.555-0.752l-0.015-0c-0.372-0.025-0.696-0.215-0.901-0.496l-0.002-0.003c-0.054-0.174-0.085-0.374-0.085-0.582 0-0.35 0.088-0.679 0.244-0.966l-0.005 0.011v-0.005l0.003-0.004c0.041-0.188 0.065-0.405 0.065-0.627 0-0.274-0.036-0.539-0.104-0.791l0.005 0.021c-0.041-0.15-0.065-0.323-0.065-0.502 0-0.242 0.043-0.473 0.123-0.687l-0.004 0.014c0.2-0.417 0.495-0.5 0.862-0.666 0.438-0.133 0.819-0.334 1.151-0.593l-0.008 0.006h0.002v-0.003c0.32-0.335 0.556-0.751 0.835-1.047 0.195-0.249 0.492-0.41 0.827-0.42l0.002-0zM21.531 21.336c-0.001 0.017-0.001 0.038-0.001 0.059 0 0.743 0.449 1.381 1.091 1.658l0.012 0.005c0.048 0.003 0.104 0.005 0.16 0.005 0.831 0 1.575-0.371 2.075-0.957l0.003-0.004 0.264-0.012c0.053-0.008 0.114-0.012 0.176-0.012 0.341 0 0.652 0.132 0.883 0.348l-0.001-0.001 0.004 0.004c0.249 0.301 0.422 0.673 0.487 1.082l0.002 0.013c0.055 0.505 0.238 0.96 0.517 1.34l-0.005-0.008c0.416 0.356 0.705 0.85 0.793 1.411l0.002 0.013 0.004-0.009v0.022l-0.004-0.015c-0.019 0.327-0.231 0.495-0.622 0.744-1.184 0.497-2.201 1.158-3.077 1.968l0.007-0.006c-0.608 0.792-1.501 1.339-2.523 1.486l-0.021 0.002c-0.074 0.010-0.16 0.016-0.247 0.016-0.768 0-1.428-0.464-1.716-1.126l-0.005-0.012-0.006-0.004c-0.093-0.286-0.146-0.615-0.146-0.956 0-0.416 0.079-0.813 0.224-1.178l-0.008 0.022c0.234-0.668 0.435-1.466 0.568-2.288l0.011-0.083c0.016-0.812 0.104-1.593 0.258-2.35l-0.014 0.083c0.085-0.518 0.381-0.954 0.794-1.225l0.007-0.004 0.056-0.027zM18.8 10.142c0.6 2.147 1.339 4.002 2.247 5.757l-0.079-0.167c0.613 1.090 1.090 2.355 1.363 3.695l0.014 0.084c0.009-0 0.020-0 0.031-0 0.217 0 0.427 0.029 0.627 0.084l-0.017-0.004c0.11-0.395 0.173-0.848 0.173-1.316 0-1.426-0.587-2.716-1.533-3.639l-0.001-0.001c-0.275-0.25-0.29-0.419-0.154-0.419 0.971 0.91 1.689 2.078 2.045 3.394l0.012 0.051c0.089 0.329 0.14 0.707 0.14 1.097 0 0.351-0.041 0.693-0.119 1.020l0.006-0.030c0.074 0.038 0.16 0.067 0.251 0.083l0.006 0.001c1.29 0.667 1.766 1.172 1.537 1.921v-0.054c-0.075-0.004-0.15 0-0.225 0h-0.020c0.189-0.584-0.227-1.031-1.331-1.53-1.143-0.5-2.057-0.42-2.212 0.581-0.011 0.049-0.019 0.106-0.022 0.165l-0 0.003c-0.073 0.030-0.16 0.058-0.25 0.078l-0.011 0.002c-0.508 0.336-0.87 0.859-0.989 1.469l-0.002 0.014c-0.148 0.695-0.241 1.5-0.256 2.323l-0 0.012v0.004c-0.091 0.637-0.23 1.207-0.418 1.753l0.020-0.066c-0.983 0.804-2.251 1.29-3.634 1.29-1.13 0-2.184-0.325-3.073-0.887l0.024 0.014c-0.146-0.253-0.313-0.472-0.503-0.667l0.001 0.001c-0.097-0.16-0.211-0.297-0.342-0.415l-0.002-0.001c0.207-0 0.407-0.031 0.596-0.088l-0.015 0.004c0.18-0.085 0.318-0.232 0.391-0.412l0.002-0.005c0.018-0.093 0.029-0.199 0.029-0.308 0-0.445-0.175-0.848-0.461-1.146l0.001 0.001c-0.619-0.761-1.359-1.395-2.196-1.88l-0.038-0.020c-0.671-0.388-1.179-0.995-1.43-1.722l-0.007-0.022c-0.093-0.318-0.147-0.684-0.147-1.062 0-0.353 0.047-0.695 0.134-1.021l-0.006 0.027c0.377-1.314 0.921-2.461 1.62-3.496l-0.028 0.043c0.134-0.081 0.046 0.169-0.51 1.217-0.474 0.713-0.757 1.59-0.757 2.533 0 0.84 0.224 1.627 0.616 2.306l-0.012-0.022c0.052-1.309 0.345-2.537 0.834-3.659l-0.025 0.065c1.055-1.902 1.854-4.111 2.275-6.452l0.020-0.131c0.060 0.045 0.271 0.169 0.361 0.252 0.272 0.166 0.475 0.416 0.737 0.581 0.267 0.26 0.633 0.42 1.035 0.42 0.021 0 0.042-0 0.063-0.001l-0.003 0c0.049 0.004 0.094 0.008 0.137 0.008 0.459-0.009 0.887-0.132 1.259-0.342l-0.013 0.007c0.362-0.167 0.65-0.417 0.925-0.5h0.006c0.535-0.145 0.983-0.454 1.3-0.869l0.004-0.006zM15.301 7.465c0.003 0 0.006-0 0.009-0 0.569 0 1.094 0.187 1.517 0.503l-0.007-0.005c0.378 0.234 0.814 0.433 1.275 0.574l0.040 0.010h0.004c0.246 0.11 0.449 0.281 0.594 0.494l0.003 0.005v-0.164c0.046 0.092 0.074 0.201 0.074 0.316 0 0.098-0.020 0.191-0.055 0.276l0.002-0.005c-0.288 0.507-0.755 0.884-1.313 1.048l-0.016 0.004v0.002c-0.335 0.169-0.626 0.416-0.968 0.581-0.35 0.21-0.771 0.334-1.222 0.334-0.015 0-0.030-0-0.045-0l0.002 0c-0.022 0.001-0.048 0.002-0.074 0.002-0.174 0-0.342-0.031-0.496-0.089l0.010 0.003c-0.159-0.087-0.29-0.169-0.417-0.257l0.014 0.010c-0.227-0.199-0.477-0.39-0.739-0.565l-0.026-0.016v-0.006h-0.006c-0.375-0.199-0.67-0.504-0.852-0.876l-0.005-0.012c-0.027-0.067-0.042-0.145-0.042-0.226 0-0.218 0.112-0.41 0.281-0.522l0.002-0.001c0.28-0.169 0.475-0.339 0.604-0.42 0.13-0.092 0.179-0.127 0.22-0.164h0.002v-0.004c0.268-0.339 0.623-0.599 1.032-0.746l0.016-0.005c0.174-0.050 0.374-0.079 0.581-0.081h0.001zM13.589 5.333h0.045c0.188 0.004 0.361 0.067 0.501 0.17l-0.002-0.002c0.179 0.159 0.325 0.352 0.425 0.57l0.004 0.011c0.113 0.245 0.183 0.53 0.191 0.83l0 0.003v0.005c0.004 0.046 0.006 0.099 0.006 0.152 0 0.063-0.003 0.126-0.009 0.188l0.001-0.008v0.1c-0.037 0.009-0.070 0.022-0.104 0.030-0.191 0.079-0.352 0.163-0.505 0.258l0.014-0.008c0.008-0.055 0.012-0.118 0.012-0.182 0-0.053-0.003-0.106-0.009-0.158l0.001 0.006v-0.019c-0.018-0.154-0.054-0.295-0.107-0.428l0.004 0.011c-0.041-0.132-0.113-0.244-0.207-0.333l-0-0c-0.055-0.050-0.128-0.081-0.209-0.081-0.007 0-0.014 0-0.021 0.001l0.001-0h-0.026c-0.103 0.011-0.189 0.075-0.232 0.163l-0.001 0.002c-0.077 0.093-0.13 0.208-0.15 0.334l-0 0.004c-0.023 0.086-0.035 0.185-0.035 0.287 0 0.044 0.002 0.088 0.007 0.131l-0-0.005v0.019c0.016 0.154 0.052 0.296 0.104 0.428l-0.004-0.011c0.042 0.132 0.113 0.245 0.207 0.335l0 0c0.012 0.012 0.026 0.022 0.042 0.030l0.001 0c-0.083 0.053-0.155 0.109-0.221 0.171l0.001-0.001c-0.045 0.040-0.1 0.070-0.161 0.084l-0.003 0.001c-0.123-0.147-0.237-0.312-0.335-0.486l-0.008-0.016c-0.113-0.245-0.183-0.529-0.194-0.83l-0-0.004c-0.004-0.048-0.006-0.104-0.006-0.161 0-0.241 0.039-0.473 0.11-0.69l-0.004 0.016c0.074-0.258 0.195-0.481 0.356-0.671l-0.002 0.003c0.127-0.15 0.313-0.245 0.522-0.25h0.001zM17.291 5.259h0.016c0.001 0 0.002 0 0.004 0 0.275 0 0.527 0.093 0.729 0.249l-0.003-0.002c0.229 0.177 0.413 0.4 0.542 0.655l0.005 0.011c0.121 0.266 0.196 0.575 0.207 0.901l0 0.004c0-0.025 0.007-0.050 0.007-0.075v0.131l-0.005-0.026-0.005-0.030c-0.003 0.32-0.071 0.622-0.193 0.897l0.006-0.014c-0.062 0.163-0.152 0.303-0.266 0.419l0-0c-0.030-0.018-0.067-0.035-0.104-0.050l-0.006-0.002c-0.135-0.042-0.253-0.099-0.36-0.169l0.005 0.003c-0.077-0.032-0.169-0.060-0.264-0.081l-0.011-0.002c0.081-0.076 0.156-0.157 0.225-0.243l0.004-0.005c0.063-0.148 0.102-0.319 0.11-0.499l0-0.003v-0.025c0-0.008 0-0.016 0-0.025 0-0.17-0.028-0.333-0.080-0.485l0.003 0.011c-0.063-0.159-0.14-0.296-0.232-0.421l0.004 0.005c-0.087-0.088-0.202-0.148-0.331-0.165l-0.003-0h-0.020c-0.001 0-0.003-0-0.004-0-0.132 0-0.25 0.065-0.322 0.164l-0.001 0.001c-0.116 0.113-0.204 0.253-0.254 0.41l-0.002 0.007c-0.063 0.147-0.104 0.318-0.112 0.496l-0 0.003v0.024c0.002 0.12 0.011 0.236 0.027 0.349l-0.002-0.015c-0.241-0.084-0.547-0.169-0.759-0.252-0.012-0.073-0.020-0.159-0.022-0.247l-0-0.003v-0.025c-0.001-0.020-0.001-0.043-0.001-0.066 0-0.324 0.069-0.631 0.194-0.908l-0.006 0.014c0.106-0.279 0.293-0.508 0.532-0.663l0.005-0.003c0.204-0.156 0.462-0.25 0.742-0.25h0zM16.63 1.004c-0.194 0-0.394 0.010-0.6 0.026-5.281 0.416-3.88 6.007-3.961 7.87-0.050 1.426-0.534 2.729-1.325 3.792l0.013-0.018c-1.407 1.602-2.555 3.474-3.351 5.523l-0.043 0.127c-0.258 0.685-0.408 1.476-0.408 2.302 0 0.285 0.018 0.566 0.052 0.841l-0.003-0.033c-0.056 0.046-0.103 0.102-0.136 0.166l-0.001 0.003c-0.325 0.335-0.562 0.75-0.829 1.048-0.283 0.217-0.615 0.388-0.975 0.494l-0.021 0.005c-0.464 0.139-0.842 0.442-1.075 0.841l-0.005 0.009c-0.104 0.212-0.165 0.461-0.165 0.725 0 0.010 0 0.019 0 0.029l-0-0.001c0.002 0.238 0.026 0.469 0.073 0.693l-0.004-0.023c0.056 0.219 0.088 0.471 0.088 0.73 0 0.17-0.014 0.337-0.041 0.5l0.002-0.018c-0.167 0.313-0.264 0.685-0.264 1.080 0 0.278 0.048 0.544 0.137 0.791l-0.005-0.016c0.273 0.388 0.686 0.662 1.164 0.749l0.011 0.002c1.274 0.107 2.451 0.373 3.561 0.78l-0.094-0.030c0.698 0.415 1.539 0.66 2.436 0.66 0.294 0 0.582-0.026 0.862-0.077l-0.029 0.004c0.667-0.151 1.211-0.586 1.504-1.169l0.006-0.013c0.734-0.004 1.537-0.336 2.824-0.417 0.873-0.072 1.967 0.334 3.22 0.25 0.037 0.159 0.086 0.298 0.148 0.429l-0.006-0.013 0.004 0.004c0.384 0.804 1.19 1.35 2.124 1.35 0.081 0 0.161-0.004 0.24-0.012l-0.010 0.001c1.151-0.17 2.139-0.768 2.813-1.623l0.007-0.009c0.843-0.768 1.827-1.401 2.905-1.853l0.067-0.025c0.432-0.191 0.742-0.585 0.81-1.059l0.001-0.007c-0.059-0.694-0.392-1.299-0.888-1.716l-0.004-0.003v-0.121l-0.004-0.004c-0.214-0.33-0.364-0.722-0.421-1.142l-0.002-0.015c-0.053-0.513-0.278-0.966-0.615-1.307l0 0h-0.004c-0.074-0.067-0.154-0.084-0.235-0.169-0.066-0.047-0.148-0.076-0.237-0.080l-0.001-0c0.195-0.602 0.308-1.294 0.308-2.013 0-0.94-0.193-1.835-0.541-2.647l0.017 0.044c-0.704-1.672-1.619-3.111-2.732-4.369l0.014 0.017c-1.105-1.082-1.828-2.551-1.948-4.187l-0.001-0.021c0.033-2.689 0.295-7.664-4.429-7.671z"></path> </g></svg>
    ),
    unknown: <Download className="w-5 h-5" />,
};

const features = [
    {
        icon: <Package className="w-8 h-8" />,
        title: 'Browse & Install Mods',
        description: 'Access the Orbis marketplace directly from the app. One-click install for mods and worlds.',
    },
    {
        icon: <FolderOpen className="w-8 h-8" />,
        title: 'Save Management',
        description: 'Manage multiple Hytale saves with per-save mod configurations. Easy organization.',
    },
    {
        icon: <Globe className="w-8 h-8" />,
        title: 'Global Mods',
        description: 'Install mods globally or per-save. Your choice, your control.',
    },
    {
        icon: <RefreshCw className="w-8 h-8" />,
        title: 'Auto-Updates',
        description: 'Keep your mods up to date automatically. Never miss a new version.',
    },
    {
        icon: <Monitor className="w-8 h-8" />,
        title: 'Multi-Platform',
        description: 'Available on Windows, macOS, and Linux. Same great experience everywhere.',
    },
    {
        icon: <Gamepad2 className="w-8 h-8" />,
        title: 'Hytale Integration',
        description: 'Launch Hytale directly from the mod loader. Seamless gaming experience.',
    },
];

const steps = [
    {
        number: '01',
        title: 'Download',
        description: 'Get the Orbis Mod Loader for your platform',
    },
    {
        number: '02',
        title: 'Browse Mods',
        description: 'Explore the Orbis marketplace for mods and worlds',
    },
    {
        number: '03',
        title: 'Install',
        description: 'One-click install to your saves or globally',
    },
    {
        number: '04',
        title: 'Play',
        description: 'Launch Hytale and enjoy your mods!',
    },
];

export default function LauncherPage() {
    const [os, setOS] = useState<OS>('unknown');
    const [mounted, setMounted] = useState(false);
    const [downloadLinks, setDownloadLinks] = useState(fallbackDownloadLinks);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setOS(detectOS());
        setMounted(true);

        // Fetch latest release from GitHub API
        const fetchLatestRelease = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/Orbis-place/Orbis-Website/releases/latest');

                if (!response.ok) {
                    console.error('Failed to fetch latest release');
                    setIsLoading(false);
                    return;
                }

                const data: GitHubRelease = await response.json();

                // Find the appropriate download URLs from the assets
                const newDownloadLinks = {
                    windows: fallbackDownloadLinks.windows,
                    macos: fallbackDownloadLinks.macos,
                    linux: fallbackDownloadLinks.linux,
                };

                data.assets.forEach((asset: GitHubAsset) => {
                    const lowerName = asset.name.toLowerCase();

                    // Match Windows executables
                    if (lowerName.endsWith('.exe') || lowerName.includes('windows') || lowerName.includes('win') && lowerName.includes('setup')) {
                        newDownloadLinks.windows = asset.browser_download_url;
                    }
                    // Match macOS DMG files
                    else if (lowerName.endsWith('.dmg') || (lowerName.includes('macos') || lowerName.includes('darwin'))) {
                        newDownloadLinks.macos = asset.browser_download_url;
                    }
                    // Match Linux packages
                    else if (lowerName.endsWith('.deb') || lowerName.endsWith('.AppImage') || lowerName.includes('linux')) {
                        newDownloadLinks.linux = asset.browser_download_url;
                    }
                });

                setDownloadLinks(newDownloadLinks);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching latest release:', error);
                setIsLoading(false);
            }
        };

        fetchLatestRelease();
    }, []);

    const primaryDownloadLink = os !== 'unknown' ? downloadLinks[os] : downloadLinks.windows;

    return (
        <div className="min-h-screen bg-[#032125]">
            {/* Hero Section - extends behind navbar */}
            <section className="relative min-h-[100vh] -mt-20 pt-20 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/launcher-image.png)' }}
                />
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#032125]/80 via-[#032125]/70 to-[#032125]" />

                {/* Background gradient effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#109eb1]/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#15C8E0]/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto text-center px-2">
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#109eb1]/20 border border-[#109eb1]/30 mb-6 sm:mb-8 backdrop-blur-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                        <span className="font-nunito text-xs sm:text-sm text-[#c7f4fa]/80">Now available in Alpha</span>
                    </div>

                    {/* Title */}
                    <h1 className={`font-hebden font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#c7f4fa] mb-4 sm:mb-6 drop-shadow-lg transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        Orbis <span className="text-[#109eb1]">Mod Loader</span>
                    </h1>

                    {/* Subtitle */}
                    <p className={`font-nunito text-base sm:text-xl md:text-2xl text-[#c7f4fa]/80 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 drop-shadow-md transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        The easiest way to manage and install mods for Hytale.
                        Browse, download, and play — all in one place.
                    </p>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <a
                            href={primaryDownloadLink}
                            className="group flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#109eb1] hover:bg-[#0d8a9b] rounded-full transition-all duration-300 shadow-lg shadow-[#109eb1]/20 hover:shadow-xl hover:shadow-[#109eb1]/30 hover:scale-105 w-full sm:w-auto justify-center"
                        >
                            {osIcons[os]}
                            <span className="font-hebden font-semibold text-base sm:text-lg text-white">
                                Download for {osNames[os]}
                            </span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <Link
                            href="/mods"
                            className="flex items-center gap-2 px-6 py-3 sm:py-4 bg-[#c7f4fa]/10 hover:bg-[#c7f4fa]/15 border border-[#c7f4fa]/20 hover:border-[#c7f4fa]/30 rounded-full backdrop-blur-sm transition-all duration-300 w-full sm:w-auto justify-center"
                        >
                            <Package className="w-5 h-5 text-[#c7f4fa]" />
                            <span className="font-hebden font-semibold text-base sm:text-lg text-[#c7f4fa]">
                                Browse Mods
                            </span>
                        </Link>
                    </div>

                    {/* Platform badges */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-10 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <span className="font-nunito text-sm text-[#c7f4fa]/50">Available on:</span>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                            {(['windows', 'macos', 'linux'] as const).map((platform) => (
                                <a
                                    key={platform}
                                    href={downloadLinks[platform]}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all duration-200 ${os === platform
                                        ? 'bg-[#109eb1]/20 border border-[#109eb1]/40 text-[#c7f4fa]'
                                        : 'bg-[#c7f4fa]/5 hover:bg-[#c7f4fa]/10 text-[#c7f4fa]/60 hover:text-[#c7f4fa]'
                                        }`}
                                >
                                    {osIcons[platform]}
                                    <span className="font-nunito text-sm">{osNames[platform]}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 rounded-full border-2 border-[#c7f4fa]/30 flex items-start justify-center p-2">
                        <div className="w-1 h-2 rounded-full bg-[#c7f4fa]/50 animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-hebden font-bold text-4xl sm:text-5xl text-[#c7f4fa] mb-4">
                            Everything you need
                        </h2>
                        <p className="font-nunito text-lg text-[#c7f4fa]/60 max-w-2xl mx-auto">
                            A complete mod management solution built for the Hytale community
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="group p-6 bg-[#06363d]/50 hover:bg-[#06363d] border border-[#084b54] hover:border-[#109eb1]/50 rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#109eb1]/10"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#109eb1]/20 text-[#109eb1] mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="font-hebden font-semibold text-xl text-[#c7f4fa] mb-2">
                                    {feature.title}
                                </h3>
                                <p className="font-nunito text-[#c7f4fa]/60 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#06363d]/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-hebden font-bold text-4xl sm:text-5xl text-[#c7f4fa] mb-4">
                            How it works
                        </h2>
                        <p className="font-nunito text-lg text-[#c7f4fa]/60 max-w-2xl mx-auto">
                            Get started in minutes with just a few simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={step.number} className="relative">
                                {/* Connector line */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-1/2 ml-8 w-[calc(100%+2rem-4rem)] h-0.5 bg-[#109eb1]/50" />
                                )}

                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#109eb1]/20 border-2 border-[#109eb1]/40 mb-4">
                                        <span className="font-hebden font-bold text-2xl text-[#109eb1]">
                                            {step.number}
                                        </span>
                                    </div>
                                    <h3 className="font-hebden font-semibold text-xl text-[#c7f4fa] mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="font-nunito text-[#c7f4fa]/60">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative p-12 rounded-[32px] bg-gradient-to-br from-[#109eb1]/20 to-[#06363d] border border-[#109eb1]/30 overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#109eb1]/10 rounded-full blur-[80px]" />

                        <div className="relative z-10 text-center">
                            <h2 className="font-hebden font-bold text-4xl sm:text-5xl text-[#c7f4fa] mb-4">
                                Ready to enhance your Hytale?
                            </h2>
                            <p className="font-nunito text-lg text-[#c7f4fa]/70 max-w-xl mx-auto mb-8">
                                Download the Orbis Mod Loader and start exploring hundreds of mods, worlds, and more.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={primaryDownloadLink}
                                    className="group flex items-center gap-3 px-8 py-4 bg-[#109eb1] hover:bg-[#0d8a9b] rounded-full transition-all duration-300 shadow-lg shadow-[#109eb1]/20 hover:shadow-xl hover:shadow-[#109eb1]/30 hover:scale-105"
                                >
                                    <Download className="w-5 h-5" />
                                    <span className="font-hebden font-semibold text-lg text-white">
                                        Download Now
                                    </span>
                                </a>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-[#c7f4fa]/50">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-[#10b981]" />
                                    <span className="font-nunito text-sm">Free & Open Source</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-[#10b981]" />
                                    <span className="font-nunito text-sm">No Account Required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-[#10b981]" />
                                    <span className="font-nunito text-sm">Multi-Platform</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
